import 'server-only';
import { createClient } from '@/core/supabase/server';
import { getCurrentKid } from '@/packages/family';
import {
  buildItemResults,
  canReveal,
  nextStep,
  retryQuestionIds,
  totalOutOf10,
  type ItemResult,
} from './lib/scoring';

export type KidAssignmentSummary = {
  id: string;
  quizTitle: string;
  dueAt: string | null;
  step: 'play1' | 'play2' | 'done';
  score: number | null;
};

type AssignmentListRow = {
  id: string;
  due_at: string | null;
  status: string;
  created_at: string;
  quizzes:
    | {
        title: string;
        quiz_questions: { position: number; points: number; question_id: string }[] | null;
      }
    | {
        title: string;
        quiz_questions: { position: number; points: number; question_id: string }[] | null;
      }[]
    | null;
  attempts:
    | {
        round: number;
        score: number | null;
        submitted_at: string | null;
        responses:
          | {
              question_id: string;
              auto_score: number | null;
              manual_score: number | null;
            }[]
          | null;
      }[]
    | null;
};

export async function listKidAssignments(): Promise<KidAssignmentSummary[]> {
  const kid = await getCurrentKid();
  if (!kid) return [];

  const sb = await createClient();
  const { data, error } = await sb
    .from('assignments')
    .select(
      `
      id,
      due_at,
      status,
      created_at,
      quizzes!assignments_quiz_id_fkey(
        title,
        quiz_questions(
          position,
          points,
          question_id
        )
      ),
      attempts(
        round,
        score,
        submitted_at,
        responses(
          question_id,
          auto_score,
          manual_score
        )
      )
    `,
    )
    .eq('kid_id', kid.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as unknown as AssignmentListRow[]).map((row) => {
    const quiz = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
    const quizQuestions = (quiz?.quiz_questions ?? [])
      .slice()
      .sort((a, b) => a.position - b.position);

    const attempts = row.attempts ?? [];
    const round1 = attempts.find((a) => a.round === 1);
    const round2 = attempts.find((a) => a.round === 2);

    const r1Responses = new Map(
      (round1?.responses ?? []).map((r) => [
        r.question_id,
        { auto_score: r.auto_score, manual_score: r.manual_score },
      ]),
    );
    const r2Responses = new Map(
      (round2?.responses ?? []).map((r) => [r.question_id, { auto_score: r.auto_score }]),
    );

    const items: ItemResult[] = buildItemResults(quizQuestions, r1Responses, r2Responses);
    const retries = retryQuestionIds(items);

    const round1Submitted = Boolean(round1 && round1.submitted_at);
    const round2Submitted = Boolean(round2 && round2.submitted_at);

    const step = nextStep({
      round1Submitted,
      round2Submitted,
      retryCount: retries.length,
    });

    const sortedAttempts = attempts.slice().sort((a, b) => b.round - a.round);
    const latestAttempt = sortedAttempts[0];
    const score = latestAttempt ? (latestAttempt.score ?? totalOutOf10(items)) : null;

    return {
      id: row.id,
      quizTitle: quiz?.title ?? '',
      dueAt: row.due_at,
      step,
      score: step === 'done' ? score : null,
    };
  });
}

export type KidQuestion = {
  id: string;
  type: string;
  prompt: string;
  lang: string;
  content: unknown;
  points: number;
};

export type KidAssignmentDetail = {
  id: string;
  quizTitle: string;
  step: 'play1' | 'play2' | 'done';
  questions: KidQuestion[];
  results: {
    questionId: string;
    r1?: number;
    r2?: number;
    needsManual: boolean;
  }[];
  score: number | null;
  comment: string | null;
  reveal: null | {
    answers: Record<string, unknown>;
    responses: Record<string, unknown>;
  };
};

type QuestionRel = {
  id: string;
  prompt: string;
  type: string;
  lang: string;
  content: unknown;
};

type AssignmentDetailRow = {
  id: string;
  kid_id: string;
  status: string;
  due_at: string | null;
  parent_comment: string | null;
  created_at: string;
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

export async function getKidAssignment(id: string): Promise<KidAssignmentDetail | null> {
  const kid = await getCurrentKid();
  if (!kid) return null;

  const sb = await createClient();
  const { data, error } = await sb
    .from('assignments')
    .select(
      `
      id,
      kid_id,
      status,
      due_at,
      parent_comment,
      created_at,
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
            content
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

  if (error || !data) return null;

  const row = data as unknown as AssignmentDetailRow;
  if (row.kid_id !== kid.id) return null;

  const quiz = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
  if (!quiz) return null;

  const attempts = row.attempts ?? [];
  const round1 = attempts.find((a) => a.round === 1);
  const round2 = attempts.find((a) => a.round === 2);

  const r1Responses = new Map((round1?.responses ?? []).map((r) => [r.question_id, r]));
  const r2Responses = new Map((round2?.responses ?? []).map((r) => [r.question_id, r]));

  const quizQuestions = (quiz.quiz_questions ?? []).slice().sort((a, b) => a.position - b.position);

  const itemResults: ItemResult[] = buildItemResults(quizQuestions, r1Responses, r2Responses);

  const retries = retryQuestionIds(itemResults);
  const round1Submitted = Boolean(round1 && round1.submitted_at);
  const round2Submitted = Boolean(round2 && round2.submitted_at);

  const step = nextStep({
    round1Submitted,
    round2Submitted,
    retryCount: retries.length,
  });

  const revealAllowed = canReveal({
    round1Submitted,
    round2Submitted,
    retryCount: retries.length,
  });

  const retrySet = new Set(retries);
  const targetQuizQuestions =
    step === 'play2' ? quizQuestions.filter((qq) => retrySet.has(qq.question_id)) : quizQuestions;

  const questions: KidQuestion[] = targetQuizQuestions.flatMap((qq) => {
    const q = Array.isArray(qq.questions) ? qq.questions[0] : qq.questions;
    if (!q) return [];
    return [
      {
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        lang: q.lang,
        content: q.content,
        points: Number(qq.points),
      },
    ];
  });

  let reveal: KidAssignmentDetail['reveal'] = null;
  if (revealAllowed) {
    const questionIds = quizQuestions.map((qq) => qq.question_id);
    const { data: answersData, error: answersError } = await sb
      .from('questions')
      .select('id, answer')
      .in('id', questionIds);

    if (!answersError && answersData) {
      const answers: Record<string, unknown> = {};
      for (const a of answersData) {
        answers[a.id] = a.answer;
      }

      const responses: Record<string, unknown> = {};
      for (const qq of quizQuestions) {
        const r1 = r1Responses.get(qq.question_id);
        const r2 = r2Responses.get(qq.question_id);
        let bestResponse: unknown = undefined;
        if (r2) {
          bestResponse = (r2.auto_score ?? 0) >= (r1?.auto_score ?? 0) ? r2.response : r1?.response;
        } else if (r1) {
          bestResponse = r1.response;
        }
        responses[qq.question_id] = bestResponse;
      }

      reveal = { answers, responses };
    }
  }

  const sortedAttempts = attempts.slice().sort((a, b) => b.round - a.round);
  const latestAttempt = sortedAttempts[0];
  const score = latestAttempt ? (latestAttempt.score ?? totalOutOf10(itemResults)) : null;

  return {
    id: row.id,
    quizTitle: quiz.title,
    step,
    questions,
    results: itemResults.map((item) => ({
      questionId: item.questionId,
      r1: item.r1,
      r2: item.r2,
      needsManual: item.needsManual,
    })),
    score,
    comment: row.parent_comment,
    reveal,
  };
}
