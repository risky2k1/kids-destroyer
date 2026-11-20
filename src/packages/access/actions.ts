'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createAdminClient } from '@/core/supabase/admin';
import { createClient } from '@/core/supabase/server';
import { canManage } from './lib/canManage';
import { permissionDiff } from './lib/diff';
import { accessErrorMessage } from './lib/errors';
import {
  accountInput,
  passwordInput,
  permissionKeys,
  roleInput,
  roleNameInput,
} from './lib/schemas';

const accountRoleInput = z.object({
  userId: z.string().min(1, 'Thiếu mã tài khoản'),
  roleId: z.string().min(1, 'Thiếu vai trò'),
});

const roleIdInput = z.string().min(1, 'Thiếu mã vai trò');
const userIdInput = z.string().min(1, 'Thiếu mã tài khoản');

async function loadTarget(
  userId: string,
): Promise<{ roleId: string; permissions: string[] } | null> {
  const sb = await createClient();
  const { data } = await sb
    .from('profiles')
    .select('id, role_id, roles(role_permissions(permission))')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;

  type TargetRoleRel =
    | { role_permissions: { permission: string }[] | null }
    | { role_permissions: { permission: string }[] | null }[]
    | null;

  const roles = data.roles as unknown as TargetRoleRel;
  const role = Array.isArray(roles) ? roles[0] : roles;
  const permissions = (role?.role_permissions ?? []).map((rp) => rp.permission);

  return {
    roleId: data.role_id,
    permissions,
  };
}

export async function createRole(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const parsed = roleInput.safeParse({
    id: fd.get('id'),
    name: fd.get('name'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { error } = await sb.from('roles').insert(parsed.data);
  if (error) return { ok: false, error: accessErrorMessage(error) };

  revalidatePath(PATHS.admin.roles);
  return { ok: true };
}

export async function renameRole(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const idParsed = roleIdInput.safeParse(fd.get('id'));
  if (!idParsed.success) return { ok: false, error: idParsed.error.issues[0].message };

  const parsed = roleNameInput.safeParse({ name: fd.get('name') });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { data, error } = await sb
    .from('roles')
    .update({ name: parsed.data.name })
    .eq('id', idParsed.data)
    .select('id');
  if (error) return { ok: false, error: accessErrorMessage(error) };
  if (!data || data.length === 0) return { ok: false, error: 'Không sửa được vai trò hệ thống' };

  revalidatePath(PATHS.admin.roles);
  revalidatePath(PATHS.admin.role(idParsed.data));
  return { ok: true };
}

export async function deleteRole(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const idParsed = roleIdInput.safeParse(fd.get('id'));
  if (!idParsed.success) return { ok: false, error: idParsed.error.issues[0].message };

  const sb = await createClient();
  const { data, error } = await sb.from('roles').delete().eq('id', idParsed.data).select('id');
  if (error) return { ok: false, error: accessErrorMessage(error) };
  if (!data || data.length === 0) return { ok: false, error: 'Không xoá được vai trò hệ thống' };

  revalidatePath(PATHS.admin.roles);
  return { ok: true };
}

export async function saveRolePermissions(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const roleIdParsed = roleIdInput.safeParse(fd.get('roleId'));
  if (!roleIdParsed.success) return { ok: false, error: roleIdParsed.error.issues[0].message };
  const roleId = roleIdParsed.data;

  if (roleId === 'super_admin') {
    return { ok: false, error: 'Quản trị tối cao luôn có mọi quyền' };
  }

  const rawPermissions = fd.getAll('permission');
  const parsed = permissionKeys.safeParse(rawPermissions);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { data: currentRows, error: curErr } = await sb
    .from('role_permissions')
    .select('permission')
    .eq('role_id', roleId);
  if (curErr) return { ok: false, error: accessErrorMessage(curErr) };

  const currentKeys = (currentRows ?? []).map((r) => r.permission);
  const { add, remove } = permissionDiff(currentKeys, parsed.data);

  // Insert first: a refused grant then leaves the role unchanged instead of half-revoked.
  if (add.length > 0) {
    const { error: insErr } = await sb
      .from('role_permissions')
      .insert(add.map((permission) => ({ role_id: roleId, permission })));
    if (insErr) return { ok: false, error: accessErrorMessage(insErr) };
  }

  if (remove.length > 0) {
    const { error: delErr } = await sb
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .in('permission', remove);
    if (delErr) return { ok: false, error: accessErrorMessage(delErr) };
  }

  revalidatePath(PATHS.admin.role(roleId));
  revalidatePath(PATHS.admin.roles);
  return { ok: true };
}

export async function setAccountRole(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const parsed = accountRoleInput.safeParse({
    userId: fd.get('userId'),
    roleId: fd.get('roleId'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { data, error } = await sb
    .from('profiles')
    .update({ role_id: parsed.data.roleId })
    .eq('id', parsed.data.userId)
    .select('id');
  if (error) return { ok: false, error: accessErrorMessage(error) };
  if (!data || data.length === 0) return { ok: false, error: 'Không tìm thấy tài khoản' };

  revalidatePath(PATHS.admin.users);
  return { ok: true };
}

export async function createAccount(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('access.manage');
  const parsed = accountInput.safeParse({
    email: fd.get('email'),
    displayName: fd.get('displayName'),
    password: fd.get('password'),
    roleId: fd.get('roleId'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (parsed.data.roleId === 'parent') {
    return { ok: false, error: 'Tài khoản phụ huynh tạo trong mục Gia đình' };
  }

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes('already')) {
      return { ok: false, error: 'Email đã được dùng' };
    }
    return { ok: false, error: 'Không tạo được tài khoản' };
  }

  const sb = await createClient();
  const { error: profileError } = await sb.from('profiles').insert({
    id: authData.user.id,
    role_id: parsed.data.roleId,
    display_name: parsed.data.displayName,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: accessErrorMessage(profileError) };
  }

  revalidatePath(PATHS.admin.users);
  return { ok: true };
}

export async function resetPassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await requirePermission('access.manage');
  const userIdParsed = userIdInput.safeParse(fd.get('userId'));
  if (!userIdParsed.success) return { ok: false, error: userIdParsed.error.issues[0].message };

  const passwordParsed = passwordInput.safeParse(fd.get('password'));
  if (!passwordParsed.success) return { ok: false, error: passwordParsed.error.issues[0].message };

  const target = await loadTarget(userIdParsed.data);
  if (!target) return { ok: false, error: 'Không tìm thấy tài khoản' };

  if (!canManage(actor, target)) {
    return { ok: false, error: 'Bạn không có quyền với tài khoản này' };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userIdParsed.data, {
    password: passwordParsed.data,
  });
  if (error) return { ok: false, error: 'Không đặt lại được mật khẩu' };

  return { ok: true };
}

export async function deleteAccount(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await requirePermission('access.manage');
  const userIdParsed = userIdInput.safeParse(fd.get('userId') ?? fd.get('id'));
  if (!userIdParsed.success) return { ok: false, error: userIdParsed.error.issues[0].message };
  const userId = userIdParsed.data;

  if (userId === actor.id) {
    return { ok: false, error: 'Không thể xoá chính mình' };
  }

  const target = await loadTarget(userId);
  if (!target) return { ok: false, error: 'Không tìm thấy tài khoản' };

  if (!canManage(actor, target)) {
    return { ok: false, error: 'Bạn không có quyền với tài khoản này' };
  }

  const sb = await createClient();
  const { data, error } = await sb.from('profiles').delete().eq('id', userId).select('id');
  if (error) {
    if (error.code === '23503') {
      return {
        ok: false,
        error:
          'Tài khoản đã tạo câu hỏi, đề hoặc giao bài nên không xoá được. Hãy đổi vai trò thay vì xoá.',
      };
    }
    return { ok: false, error: accessErrorMessage(error) };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'Không xoá được tài khoản' };
  }

  // The profile is gone so the account can no longer sign in to the app.
  await createAdminClient()
    .auth.admin.deleteUser(userId)
    .catch(() => {});

  revalidatePath(PATHS.admin.users);
  return { ok: true };
}
