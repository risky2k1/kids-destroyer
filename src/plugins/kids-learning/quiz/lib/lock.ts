import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/core/supabase/database.types';

/** True when any assignment uses this quiz. */
export async function isQuizLocked(sb: SupabaseClient<Database>, id: string): Promise<boolean> {
  const used = await sb.from('assignments').select('id').eq('quiz_id', id).limit(1);
  if (used.error) throw used.error;
  return (used.data?.length ?? 0) > 0;
}
