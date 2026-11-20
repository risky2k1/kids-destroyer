'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';
import { permissionDiff } from './lib/diff';
import { accessErrorMessage } from './lib/errors';
import { permissionKeys, roleInput, roleNameInput } from './lib/schemas';

const accountRoleInput = z.object({
  userId: z.string().min(1, 'Thiếu mã tài khoản'),
  roleId: z.string().min(1, 'Thiếu vai trò'),
});

const roleIdInput = z.string().min(1, 'Thiếu mã vai trò');

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
