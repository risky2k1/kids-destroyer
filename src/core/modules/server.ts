import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/core/supabase/server';

export const disabledModules = cache(async (): Promise<string[]> => {
  const sb = await createClient();
  const { data } = await sb.from('modules').select('id').eq('enabled', false);
  return (data ?? []).map((row) => row.id);
});

export async function requireModule(id: string): Promise<void> {
  const disabled = await disabledModules();
  if (disabled.includes(id)) {
    notFound();
  }
}
