import 'server-only';
import { cache } from 'react';
import { createClient } from '@/core/supabase/server';
import { fromRows, type AppSettings } from './lib/schemas';

/** Per-request cached; anonymous visitors (RLS: authenticated only) get defaults. */
export const getSettings = cache(async (): Promise<AppSettings> => {
  const sb = await createClient();
  const { data } = await sb.from('settings').select('key, value');
  return fromRows(data ?? []);
});
