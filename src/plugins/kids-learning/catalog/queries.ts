import 'server-only';
import { createClient } from '@/core/supabase/server';

export async function listCatalog() {
  const sb = await createClient();
  const [subjects, grades, topics] = await Promise.all([
    sb.from('subjects').select('id, name, sort').order('sort'),
    sb.from('grades').select('id, name, sort').order('sort'),
    sb.from('topics').select('id, name, subject_id, grade_id').order('name'),
  ]);
  return { subjects: subjects.data ?? [], grades: grades.data ?? [], topics: topics.data ?? [] };
}

export type Catalog = Awaited<ReturnType<typeof listCatalog>>;
