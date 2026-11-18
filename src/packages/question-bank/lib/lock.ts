import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/core/supabase/database.types';

/** True when any assignment uses a quiz that contains this question. */
export async function isQuestionLocked(sb: SupabaseClient<Database>, id: string): Promise<boolean> {
  const links = await sb.from('quiz_questions').select('quiz_id').eq('question_id', id);
  if (links.error) throw links.error;
  const quizIds = [...new Set((links.data ?? []).map((row) => row.quiz_id))];
  if (quizIds.length === 0) return false;
  const used = await sb.from('assignments').select('id').in('quiz_id', quizIds).limit(1);
  if (used.error) throw used.error;
  return (used.data?.length ?? 0) > 0;
}
