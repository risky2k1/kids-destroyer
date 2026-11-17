'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { getCurrentUser, homeFor } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';

const credentials = z.object({ email: z.email(), password: z.string().min(8) });
const WRONG = 'Email hoặc mật khẩu không đúng';

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: WRONG };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: WRONG };
  const user = await getCurrentUser();
  redirect(user ? homeFor(user.role) : PATHS.login);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(PATHS.login);
}
