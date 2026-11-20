import 'server-only';
import { createClient } from '@/core/supabase/server';
import { kidsByGrade } from './lib/stats';

export async function getDashboard(): Promise<{
  families: number;
  parents: number;
  kids: number;
  topics: number;
  pendingReview: number;
  recent: { id: string; name: string; created_at: string }[];
  byGrade: { name: string; count: number }[];
}> {
  const sb = await createClient();
  const [families, parents, kids, topics, recent, grades, kidGrades, pending] = await Promise.all([
    sb.from('families').select('id', { count: 'exact', head: true }),
    sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role_id', 'parent'),
    sb.from('kids').select('id', { count: 'exact', head: true }),
    sb.from('topics').select('id', { count: 'exact', head: true }),
    sb
      .from('families')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb.from('grades').select('id, name, sort'),
    sb.from('kids').select('grade_id'),
    sb.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
  ]);

  return {
    families: families.count ?? 0,
    parents: parents.count ?? 0,
    kids: kids.count ?? 0,
    topics: topics.count ?? 0,
    pendingReview: pending.count ?? 0,
    recent: recent.data ?? [],
    byGrade: kidsByGrade(grades.data ?? [], kidGrades.data ?? []),
  };
}
