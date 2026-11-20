'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { BRANDING_TYPES, checkBrandingFile } from './lib/branding';
import { settingsInput } from './lib/schemas';

const BRANDING_KINDS = [
  { kind: 'logo', key: 'logo_url' },
  { kind: 'favicon', key: 'favicon_url' },
] as const;

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('settings.manage');
  const parsed = settingsInput.safeParse({
    siteName: fd.get('siteName'),
    allowRetry: fd.get('allowRetry') === 'on',
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();

  const rowsToUpsert: { key: string; value: string | boolean }[] = [
    { key: 'site_name', value: parsed.data.siteName },
    { key: 'allow_retry', value: parsed.data.allowRetry },
  ];

  for (const { kind, key } of BRANDING_KINDS) {
    const raw = fd.get(kind);
    const hasFile = raw instanceof File && raw.size > 0;

    if (hasFile) {
      const err = checkBrandingFile(raw);
      if (err) return { ok: false, error: err };

      const ext = BRANDING_TYPES[raw.type];
      // shortcut: an old file with another extension stays in the bucket; clean up when it matters.
      const { error: uploadError } = await sb.storage
        .from('branding')
        .upload(`${kind}.${ext}`, raw, { upsert: true, contentType: raw.type });
      if (uploadError) return { ok: false, error: 'Không tải được ảnh lên' };

      const {
        data: { publicUrl },
      } = sb.storage.from('branding').getPublicUrl(`${kind}.${ext}`);
      rowsToUpsert.push({ key, value: `${publicUrl}?v=${Date.now()}` });
    } else if (fd.get(`remove-${kind}`) === 'on') {
      const { error: deleteError } = await sb.from('settings').delete().eq('key', key);
      if (deleteError) return { ok: false, error: 'Không lưu được cài đặt' };
    }
  }

  const { error } = await sb.from('settings').upsert(rowsToUpsert);
  if (error) return { ok: false, error: 'Không lưu được cài đặt' };

  revalidatePath('/', 'layout');
  return { ok: true };
}
