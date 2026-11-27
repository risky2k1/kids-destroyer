import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/core/supabase/database.types';

/** True when the question sits in an assigned quiz, or in a quiz owned by someone else. */
export async function isQuestionLocked(sb: SupabaseClient<Database>, id: string): Promise<boolean> {
  const used = await sb.rpc('question_in_use', { p_question_id: id });
  if (used.error) throw used.error;
  return used.data === true;
}
