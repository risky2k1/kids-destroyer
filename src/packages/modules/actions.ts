'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { moduleToggleInput } from './lib/schemas';

export async function setModuleEnabled(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('modules.manage');
  const parsed = moduleToggleInput.safeParse({
    id: fd.get('id'),
    enabled: fd.get('enabled'),
  });
  if (!parsed.success) return { ok: false, error: 'Không lưu được' };

  const sb = await createClient();
  const { error } = await sb.from('modules').upsert({
    id: parsed.data.id,
    enabled: parsed.data.enabled,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: 'Không lưu được' };

  revalidatePath('/', 'layout');
  return { ok: true };
}
