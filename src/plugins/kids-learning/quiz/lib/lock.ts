import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/core/supabase/database.types';

/** True when any family has assigned this quiz. */
export async function isQuizLocked(sb: SupabaseClient<Database>, id: string): Promise<boolean> {
  const used = await sb.rpc('quiz_in_use', { p_quiz_id: id });
  if (used.error) throw used.error;
  return used.data === true;
}
