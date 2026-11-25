'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createAdminClient } from '@/core/supabase/admin';
import { createClient } from '@/core/supabase/server';
import { catalogErrorMessage } from '@/plugins/kids-learning/catalog';
import { hashPin } from './lib/pin';
import { familyInput, kidInput, parentInput } from './lib/schemas';

const optionalId = z.uuid().optional().catch(undefined);
const firstIssue = (e: z.ZodError) => ({ ok: false, error: e.issues[0].message });

function done(familyId?: string): ActionState {
  revalidatePath(PATHS.admin.families);
  if (familyId) revalidatePath(PATHS.admin.family(familyId));
  return { ok: true };
}

export async function saveFamily(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('families.manage');
  const parsed = familyInput.safeParse({ name: fd.get('name') });
  if (!parsed.success) return firstIssue(parsed.error);
  const id = optionalId.parse(fd.get('id') || undefined);
  const sb = await createClient();
  const { error } = id
    ? await sb.from('families').update(parsed.data).eq('id', id)
    : await sb.from('families').insert(parsed.data);
  if (error) return { ok: false, error: catalogErrorMessage(error) };
  return done(id);
}

export async function createParent(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('families.manage');
  const parsed = parentInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return firstIssue(parsed.error);
  const { email, password, displayName, familyId } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    const taken = error?.code === 'email_exists' || error?.status === 422;
    return { ok: false, error: taken ? 'Email đã được dùng' : 'Không tạo được tài khoản' };
  }

  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    role_id: 'parent',
    family_id: familyId,
    display_name: displayName,
  });
  if (pErr) {
    // Never leave an auth user without a profile.
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, error: 'Không tạo được tài khoản' };
  }
  return done(familyId);
}

/** Create or edit a kid. A new PIN (required on create) also clears any PIN lockout. */
export async function saveKid(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('families.manage');
  const parsed = kidInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return firstIssue(parsed.error);
  const { displayName, avatar, gradeId, familyId, pin } = parsed.data;
  const id = optionalId.parse(fd.get('id') || undefined);
  if (!id && !pin) return { ok: false, error: 'Cần đặt PIN cho bé' };

  const row = {
    display_name: displayName,
    avatar,
    grade_id: gradeId,
    ...(pin && { pin_hash: await hashPin(pin), pin_failed_count: 0, pin_locked_until: null }),
  };
  const sb = await createClient();
  const { error } = id
    ? await sb.from('kids').update(row).eq('id', id)
    : await sb.from('kids').insert({ ...row, family_id: familyId, pin_hash: row.pin_hash! });
  if (error) return { ok: false, error: catalogErrorMessage(error) };
  return done(familyId);
}
