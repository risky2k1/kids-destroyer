import 'server-only';
import { createClient } from '@/core/supabase/server';

/** Rows in `plugins`. A missing id means enabled (`map[id] !== false`). */
export async function enabledMap(): Promise<Record<string, boolean>> {
  const sb = await createClient();
  const { data } = await sb.from('plugins').select('id, enabled');
  const map: Record<string, boolean> = {};
  for (const row of data ?? []) map[row.id] = row.enabled;
  return map;
}
