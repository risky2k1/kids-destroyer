'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { clearKidCookie, setKidCookie } from '@/core/auth/kidCookie';
import { homeFor, requireArea, requireUser } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';
import { afterFailedPin, isLocked } from './lib/lockout';
import { verifyPin } from './lib/pin';
import { pinSchema } from './lib/schemas';

const enterInput = z.object({ kidId: z.uuid(), pin: pinSchema });

export async function enterKidMode(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireArea('kid');
  const parsed = enterInput.safeParse({ kidId: fd.get('kidId'), pin: fd.get('pin') });
  if (!parsed.success) return { ok: false, error: 'Sai PIN' };
  const { kidId, pin } = parsed.data;

  const sb = await createClient(); // parent session → RLS: only own family's kids
  const { data: kid } = await sb
    .from('kids')
    .select('id, pin_hash, pin_failed_count, pin_locked_until')
    .eq('id', kidId)
    .maybeSingle();
  if (!kid) return { ok: false, error: 'Không tìm thấy bé' };

  const now = Date.now();
  if (isLocked(kid.pin_locked_until, now)) {
    return { ok: false, error: 'Sai nhiều lần, thử lại sau 5 phút' };
  }
  if (!(await verifyPin(pin, kid.pin_hash))) {
    const next = afterFailedPin(kid.pin_failed_count, now);
    await sb
      .from('kids')
      .update({ pin_failed_count: next.failCount, pin_locked_until: next.lockedUntil })
      .eq('id', kid.id);
    return {
      ok: false,
      error: next.lockedUntil ? 'Sai nhiều lần, thử lại sau 5 phút' : 'Sai PIN',
    };
  }

  await sb.from('kids').update({ pin_failed_count: 0, pin_locked_until: null }).eq('id', kid.id);
  await setKidCookie(kid.id);
  redirect(PATHS.kid.root);
}

/** Leaving kid mode requires the parent's password, so kids can't wander into the parent area. */
export async function exitKidMode(_: ActionState, fd: FormData): Promise<ActionState> {
  // Any signed-in adult may clear kid mode on this device, but only with their password.
  const user = await requireUser();
  const password = String(fd.get('password') ?? '');
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: user.email, password });
  if (error) return { ok: false, error: 'Mật khẩu không đúng' };
  await clearKidCookie();
  redirect(homeFor(user));
}
