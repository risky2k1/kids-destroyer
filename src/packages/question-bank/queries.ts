import 'server-only';
import { z } from 'zod';
import { enabledMap } from '@/core/plugins/server';
import { getPlugin, PLUGIN_IDS } from '@/plugins/registry';
import { createClient } from '@/core/supabase/server';
import { isQuestionLocked } from './lib/lock';
import type { QuestionSummary } from './lib/questionRow';

const LIST =
  'id, prompt, type, subject_id, grade_id, created_at, subjects!questions_subject_id_fkey(name), grades!questions_grade_id_fkey(name), topics!questions_topic_id_fkey(name)';

type ListRow = {
  id: string;
  prompt: string;
  type: string;
  subject_id: string;
  grade_id: string;
  created_at: string;
  subjects: { name: string } | { name: string }[] | null;
  grades: { name: string } | { name: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
};

const oneName = (value: ListRow['subjects']) => {
  if (!value) return '';
  return Array.isArray(value) ? (value[0]?.name ?? '') : value.name;
};

const uuid = z.uuid();

export async function listQuestions(filter: {
  subjectId?: string;
  gradeId?: string;
  type?: string;
}): Promise<QuestionSummary[]> {
  const sb = await createClient();
  let query = sb
    .from('questions')
    .select(LIST)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (filter.subjectId && uuid.safeParse(filter.subjectId).success) {
    query = query.eq('subject_id', filter.subjectId);
  }
  if (filter.gradeId && uuid.safeParse(filter.gradeId).success) {
    query = query.eq('grade_id', filter.gradeId);
  }
  if (filter.type) query = query.eq('type', filter.type);
  const { data } = await query;
  return ((data ?? []) as ListRow[]).map((row) => ({
    id: row.id,
    prompt: row.prompt,
    type: row.type,
    typeName: getPlugin(row.type)?.name ?? row.type,
    subjectId: row.subject_id,
    gradeId: row.grade_id,
    subjectName: oneName(row.subjects),
    gradeName: oneName(row.grades),
    topicName: oneName(row.topics),
    createdAt: row.created_at,
  }));
}

export async function getQuestion(id: string) {
  const sb = await createClient();
  const { data, error } = await sb
    .from('questions')
    .select('id, type, subject_id, grade_id, topic_id, lang, prompt, content, answer')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    type: data.type,
    subjectId: data.subject_id,
    gradeId: data.grade_id,
    topicId: data.topic_id,
    lang: data.lang,
    prompt: data.prompt,
    content: data.content,
    answer: data.answer,
    locked: await isQuestionLocked(sb, id),
  };
}

export type QuestionDetail = NonNullable<Awaited<ReturnType<typeof getQuestion>>>;

export async function listEnabledTypes() {
  const map = await enabledMap();
  return PLUGIN_IDS.flatMap((id) => {
    if (map[id] === false) return [];
    const plugin = getPlugin(id);
    if (!plugin) return [];
    return [{ id, name: plugin.name, description: plugin.description }];
  });
}

/** Non-archived question counts per plugin id, including disabled types. */
export async function countQuestionsByType() {
  const sb = await createClient();
  const { data } = await sb.from('questions').select('type').is('archived_at', null);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.type] = (counts[row.type] ?? 0) + 1;
  return counts;
}
