import 'server-only';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { createClient } from '@/core/supabase/server';
import { isQuizLocked } from './lib/lock';

const LIST =
  'id, title, origin, created_by, subjects!quizzes_subject_id_fkey(name), grades!quizzes_grade_id_fkey(name), quiz_questions(points)';

const DETAIL =
  'id, title, subject_id, grade_id, created_by, quiz_questions(position, points, question_id, questions!quiz_questions_question_id_fkey(prompt, type))';

type Named = { name: string } | { name: string }[] | null;

const oneName = (value: Named) => {
  if (!value) return '';
  return Array.isArray(value) ? (value[0]?.name ?? '') : value.name;
};

export type QuizSummary = {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  questionCount: number;
  totalPoints: number;
  origin: 'system' | 'parent';
  mine: boolean;
};

type ListRow = {
  id: string;
  title: string;
  origin: string;
  created_by: string;
  subjects: Named;
  grades: Named;
  quiz_questions: { points: number }[] | null;
};

export async function listQuizzes(): Promise<QuizSummary[]> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id ?? '';
  const { data } = await sb
    .from('quizzes')
    .select(LIST)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  return ((data ?? []) as ListRow[]).map((row) => {
    const points = (row.quiz_questions ?? []).map((item) => Number(item.points));
    return {
      id: row.id,
      title: row.title,
      subjectName: oneName(row.subjects),
      gradeName: oneName(row.grades),
      questionCount: points.length,
      totalPoints: points.reduce((sum, value) => sum + value, 0),
      origin: row.origin === 'parent' ? 'parent' : 'system',
      mine: row.created_by === uid,
    };
  });
}

type QuestionRel = { prompt: string; type: string } | { prompt: string; type: string }[] | null;

type DetailRow = {
  id: string;
  title: string;
  subject_id: string;
  grade_id: string;
  created_by: string;
  quiz_questions:
    | {
        position: number;
        points: number;
        question_id: string;
        questions: QuestionRel;
      }[]
    | null;
};

const oneQuestion = (value: QuestionRel) => {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export async function getQuiz(id: string) {
  const sb = await createClient();
  const { data, error } = await sb.from('quizzes').select(DETAIL).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as DetailRow;
  const items = (row.quiz_questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((item) => {
      const question = oneQuestion(item.questions);
      if (!question) return [];
      return [
        {
          questionId: item.question_id,
          prompt: question.prompt,
          typeName: getPlugin(question.type)?.name ?? question.type,
          points: Number(item.points),
        },
      ];
    });
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    gradeId: row.grade_id,
    createdBy: row.created_by,
    locked: await isQuizLocked(sb, id),
    items,
  };
}

export type QuizDetail = NonNullable<Awaited<ReturnType<typeof getQuiz>>>;
