'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { settingsInput } from './lib/schemas';

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('settings.manage');
  const parsed = settingsInput.safeParse({
    siteName: fd.get('siteName'),
    allowRetry: fd.get('allowRetry') === 'on',
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { error } = await sb.from('settings').upsert([
    { key: 'site_name', value: parsed.data.siteName },
    { key: 'allow_retry', value: parsed.data.allowRetry },
  ]);
  if (error) return { ok: false, error: 'Không lưu được cài đặt' };

  revalidatePath('/', 'layout');
  return { ok: true };
}
