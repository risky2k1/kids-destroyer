import 'server-only';
import { createClient } from '@/core/supabase/server';
import { totalOutOf10, type ItemResult } from './lib/scoring';

export type AssignmentSummary = {
  id: string;
  kidName: string;
  kidAvatar: string;
  quizTitle: string;
  dueAt: string | null;
  status: 'assigned' | 'submitted' | 'reviewed';
  score: number | null;
  createdAt: string;
};

type ListRow = {
  id: string;
  due_at: string | null;
  status: string;
  created_at: string;
  kids:
    { display_name: string; avatar: string } | { display_name: string; avatar: string }[] | null;
  quizzes: { title: string } | { title: string }[] | null;
  attempts: { round: number; score: number | null }[] | null;
};

export async function listAssignments(): Promise<AssignmentSummary[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('assignments')
    .select(
      `
      id,
      due_at,
      status,
      created_at,
      kids!assignments_kid_id_fkey(display_name, avatar),
      quizzes!assignments_quiz_id_fkey(title),
      attempts(round, score)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as unknown as ListRow[]).map((row) => {
    const kid = Array.isArray(row.kids) ? row.kids[0] : row.kids;
    const quiz = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
    const attempts = (row.attempts ?? []).slice().sort((a, b) => b.round - a.round);
    const latestAttempt = attempts[0];
    return {
      id: row.id,
      kidName: kid?.display_name ?? '',
      kidAvatar: kid?.avatar ?? '🦊',
      quizTitle: quiz?.title ?? '',
      dueAt: row.due_at,
      status: row.status as 'assigned' | 'submitted' | 'reviewed',
      score: latestAttempt?.score ?? null,
      createdAt: row.created_at,
    };
  });
}

export type AssignableKid = {
  id: string;
  name: string;
  avatar: string;
  familyName: string;
};

type KidRow = {
  id: string;
  display_name: string;
  avatar: string;
  families: { name: string } | { name: string }[] | null;
};

export async function listAssignableKids(): Promise<AssignableKid[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('kids')
    .select('id, display_name, avatar, families!kids_family_id_fkey(name)')
    .order('display_name');

  if (error) throw error;
  if (!data) return [];

  return (data as unknown as KidRow[]).map((row) => {
    const family = Array.isArray(row.families) ? row.families[0] : row.families;
    return {
      id: row.id,
      name: row.display_name,
      avatar: row.avatar,
      familyName: family?.name ?? '',
    };
  });
}

export type QuizOption = {
  id: string;
  title: string;
  questionCount: number;
};

export async function listQuizOptions(): Promise<QuizOption[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('quizzes')
    .select('id, title, quiz_questions(points)')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data
    .filter((row) => (row.quiz_questions ?? []).length > 0)
    .map((row) => ({
      id: row.id,
      title: row.title,
      questionCount: (row.quiz_questions ?? []).length,
    }));
}

export type AssignmentResultDetail = {
  id: string;
  status: 'assigned' | 'submitted' | 'reviewed';
  dueAt: string | null;
  parentComment: string | null;
  createdAt: string;
  kid: {
    id: string;
    displayName: string;
    avatar: string;
  };
  quiz: {
    id: string;
    title: string;
  };
  score: number | null;
  canDelete: boolean;
  items: {
    questionId: string;
    position: number;
    points: number;
    prompt: string;
    type: string;
    lang: string;
    content: unknown;
    answer: unknown;
    needsManual: boolean;
    r1Score?: number;
    r2Score?: number;
    manualScore?: number | null;
    feedback?: string | null;
    bestResponse?: unknown;
    r1ResponseId?: string;
  }[];
};

type QuestionRel = {
  id: string;
  prompt: string;
  type: string;
  lang: string;
  content: unknown;
  answer: unknown;
};

type DetailRow = {
  id: string;
  status: string;
  due_at: string | null;
  parent_comment: string | null;
  created_at: string;
  kids:
    | { id: string; display_name: string; avatar: string }
    | { id: string; display_name: string; avatar: string }[]
    | null;
  quizzes:
    | {
        id: string;
        title: string;
        quiz_questions:
          | {
              position: number;
              points: number;
              question_id: string;
              questions: QuestionRel | QuestionRel[] | null;
            }[]
          | null;
      }
    | {
        id: string;
        title: string;
        quiz_questions:
          | {
              position: number;
              points: number;
              question_id: string;
              questions: QuestionRel | QuestionRel[] | null;
            }[]
          | null;
      }[]
    | null;
  attempts:
    | {
        id: string;
        round: number;
        score: number | null;
        started_at: string;
        submitted_at: string | null;
        responses:
          | {
              id: string;
              question_id: string;
              response: unknown;
              auto_score: number | null;
              manual_score: number | null;
              feedback: string | null;
            }[]
          | null;
      }[]
    | null;
};

export async function getAssignmentResult(id: string): Promise<AssignmentResultDetail | null> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('assignments')
    .select(
      `
      id,
      status,
      due_at,
      parent_comment,
      created_at,
      kids!assignments_kid_id_fkey(id, display_name, avatar),
      quizzes!assignments_quiz_id_fkey(
        id,
        title,
        quiz_questions(
          position,
          points,
          question_id,
          questions!quiz_questions_question_id_fkey(
            id,
            prompt,
            type,
            lang,
            content,
            answer
          )
        )
      ),
      attempts(
        id,
        round,
        score,
        started_at,
        submitted_at,
        responses(
          id,
          question_id,
          response,
          auto_score,
          manual_score,
          feedback
        )
      )
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  const kid = Array.isArray(row.kids) ? row.kids[0] : row.kids;
  const quiz = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
  if (!kid || !quiz) return null;

  const attempts = row.attempts ?? [];
  const round1 = attempts.find((a) => a.round === 1);
  const round2 = attempts.find((a) => a.round === 2);

  const r1Responses = new Map((round1?.responses ?? []).map((r) => [r.question_id, r]));
  const r2Responses = new Map((round2?.responses ?? []).map((r) => [r.question_id, r]));

  const quizQuestions = (quiz.quiz_questions ?? []).slice().sort((a, b) => a.position - b.position);

  const items = quizQuestions.flatMap((qq) => {
    const q = Array.isArray(qq.questions) ? qq.questions[0] : qq.questions;
    if (!q) return [];
    const r1 = r1Responses.get(qq.question_id);
    const r2 = r2Responses.get(qq.question_id);

    const r1Score =
      r1?.auto_score !== null && r1?.auto_score !== undefined ? Number(r1.auto_score) : undefined;
    const r2Score =
      r2?.auto_score !== null && r2?.auto_score !== undefined ? Number(r2.auto_score) : undefined;
    const manualScore =
      r1?.manual_score !== null && r1?.manual_score !== undefined ? Number(r1.manual_score) : null;
    const feedback = r1?.feedback ?? null;

    let bestResponse: unknown = undefined;
    if (r2) {
      bestResponse = (r2.auto_score ?? 0) >= (r1?.auto_score ?? 0) ? r2.response : r1?.response;
    } else if (r1) {
      bestResponse = r1.response;
    }

    // submitRound leaves auto_score null exactly for questions a person must mark.
    const needsManual = r1 !== undefined && r1.auto_score === null;

    return [
      {
        questionId: qq.question_id,
        position: qq.position,
        points: Number(qq.points),
        prompt: q.prompt,
        type: q.type,
        lang: q.lang,
        content: q.content,
        answer: q.answer,
        needsManual,
        r1Score,
        r2Score,
        manualScore,
        feedback,
        bestResponse,
        r1ResponseId: r1?.id,
      },
    ];
  });

  const itemResults: ItemResult[] = items.map((item) => ({
    questionId: item.questionId,
    points: item.points,
    needsManual: item.needsManual,
    r1: item.r1Score,
    r2: item.r2Score,
    manual: item.manualScore,
  }));

  const sortedAttempts = attempts.slice().sort((a, b) => b.round - a.round);
  const latestAttempt = sortedAttempts[0];
  const score = latestAttempt ? (latestAttempt.score ?? totalOutOf10(itemResults)) : null;

  return {
    id: row.id,
    status: row.status as 'assigned' | 'submitted' | 'reviewed',
    dueAt: row.due_at,
    parentComment: row.parent_comment,
    createdAt: row.created_at,
    kid: {
      id: kid.id,
      displayName: kid.display_name,
      avatar: kid.avatar,
    },
    quiz: {
      id: quiz.id,
      title: quiz.title,
    },
    score,
    canDelete: attempts.length === 0,
    items,
  };
}
