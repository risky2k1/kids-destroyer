'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/core/actions';
import { PATHS } from '@/core/routes';
import type { Json } from '@/core/supabase/database.types';
import { createClient } from '@/core/supabase/server';
import { getCurrentKid } from '@/packages/family';
import { getPlugin } from '@/plugins/registry';
import { assignmentErrorMessage } from './lib/errors';
import { submitInput } from './lib/schemas';
import {
  buildItemResults,
  nextStep,
  retryQuestionIds,
  statusAfterRound1,
  totalOutOf10,
  type ItemResult,
} from './lib/scoring';

type QuizQuestionRel = {
  position: number;
  points: number;
  question_id: string;
  questions:
    | {
        id: string;
        type: string;
        content: Json;
        answer: Json;
      }
    | {
        id: string;
        type: string;
        content: Json;
        answer: Json;
      }[]
    | null;
};

type AssignmentLoadRow = {
  id: string;
  kid_id: string;
  status: string;
  quizzes:
    | {
        id: string;
        quiz_questions: QuizQuestionRel[] | null;
      }
    | {
        id: string;
        quiz_questions: QuizQuestionRel[] | null;
      }[]
    | null;
  attempts:
    | {
        id: string;
        round: number;
        score: number | null;
        submitted_at: string | null;
        responses:
          | {
              id: string;
              question_id: string;
              auto_score: number | null;
              manual_score: number | null;
            }[]
          | null;
      }[]
    | null;
};

export async function submitRound(_: ActionState, fd: FormData): Promise<ActionState> {
  const kid = await getCurrentKid();
  if (!kid) return { ok: false, error: 'Phiên làm bài đã hết' };

  let responsesRaw: unknown = {};
  try {
    responsesRaw = JSON.parse(String(fd.get('responses') ?? '{}'));
  } catch {
    return { ok: false, error: 'Dữ liệu bài làm không hợp lệ' };
  }

  const parsed = submitInput.safeParse({
    assignmentId: fd.get('assignmentId'),
    round: fd.get('round'),
    responses: responsesRaw,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const sb = await createClient();
  const { data, error: loadError } = await sb
    .from('assignments')
    .select(
      `
      id,
      kid_id,
      status,
      quizzes!assignments_quiz_id_fkey(
        id,
        quiz_questions(
          position,
          points,
          question_id,
          questions!quiz_questions_question_id_fkey(
            id,
            type,
            content,
            answer
          )
        )
      ),
      attempts(
        id,
        round,
        score,
        submitted_at,
        responses(
          id,
          question_id,
          auto_score,
          manual_score
        )
      )
    `,
    )
    .eq('id', parsed.data.assignmentId)
    .maybeSingle();

  if (loadError || !data) {
    return { ok: false, error: assignmentErrorMessage(loadError ?? {}) };
  }

  const assignment = data as unknown as AssignmentLoadRow;
  if (assignment.kid_id !== kid.id) {
    return { ok: false, error: 'Bài không thuộc về bé' };
  }

  const quiz = Array.isArray(assignment.quizzes) ? assignment.quizzes[0] : assignment.quizzes;
  const quizQuestions = (quiz?.quiz_questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  if (quizQuestions.length === 0) {
    return { ok: false, error: 'Đề thi không có câu hỏi' };
  }

  const attempts = assignment.attempts ?? [];
  const round1Attempt = attempts.find((a) => a.round === 1);
  const round2Attempt = attempts.find((a) => a.round === 2);

  if (parsed.data.round === 1 && round1Attempt) {
    return { ok: false, error: 'Bài đã nộp' };
  }

  if (parsed.data.round === 2 && (!round1Attempt || round2Attempt)) {
    return { ok: false, error: 'Bài đã nộp' };
  }

  const r1Responses = new Map((round1Attempt?.responses ?? []).map((r) => [r.question_id, r]));

  let targetQuestions: QuizQuestionRel[] = [];
  if (parsed.data.round === 1) {
    targetQuestions = quizQuestions;
  } else {
    const r1Items = buildItemResults(quizQuestions, r1Responses);
    const retries = retryQuestionIds(r1Items);
    const retrySet = new Set(retries);

    if (retries.length === 0) {
      return { ok: false, error: 'Bài đã nộp' };
    }

    const submittedKeys = Object.keys(parsed.data.responses);
    const hasInvalid = submittedKeys.some((qid) => !retrySet.has(qid));
    if (hasInvalid) {
      return { ok: false, error: 'Bài đã nộp' };
    }

    targetQuestions = quizQuestions.filter((qq) => retrySet.has(qq.question_id));
  }

  const processedResponses = targetQuestions.map((qq) => {
    const q = Array.isArray(qq.questions) ? qq.questions[0] : qq.questions;
    const raw = parsed.data.responses[qq.question_id];

    if (!q || raw === undefined || raw === null) {
      return {
        questionId: qq.question_id,
        response: null as Json,
        autoScore: 0,
      };
    }

    const plugin = getPlugin(q.type);
    if (!plugin) {
      return {
        questionId: qq.question_id,
        response: null as Json,
        autoScore: 0,
      };
    }

    const parsedResponse = plugin.responseSchema.safeParse(raw);
    if (!parsedResponse.success) {
      return {
        questionId: qq.question_id,
        response: null as Json,
        autoScore: 0,
      };
    }

    const grade = plugin.grade(q.content, q.answer, parsedResponse.data);
    const autoScore = grade.needsManual ? null : grade.score;

    return {
      questionId: qq.question_id,
      response: parsedResponse.data as Json,
      autoScore,
    };
  });

  const now = new Date().toISOString();
  const { data: attemptRow, error: attemptError } = await sb
    .from('attempts')
    .insert({
      assignment_id: parsed.data.assignmentId,
      round: parsed.data.round,
      started_at: now,
      submitted_at: now,
    })
    .select('id')
    .single();

  if (attemptError || !attemptRow) {
    if (attemptError?.code === '23505') {
      return { ok: false, error: 'Bài đã nộp' };
    }
    return { ok: false, error: assignmentErrorMessage(attemptError ?? {}) };
  }

  const responseRows = processedResponses.map((item) => ({
    attempt_id: attemptRow.id,
    question_id: item.questionId,
    response: item.response,
    auto_score: item.autoScore,
  }));

  const { error: responsesError } = await sb.from('responses').insert(responseRows);
  if (responsesError) {
    // Drop the empty attempt so the kid can submit again instead of being locked out.
    await sb.from('attempts').delete().eq('id', attemptRow.id);
    return { ok: false, error: assignmentErrorMessage(responsesError) };
  }

  let allItems: ItemResult[] = [];
  if (parsed.data.round === 1) {
    const round1Map = new Map(
      processedResponses.map((p) => [
        p.questionId,
        { auto_score: p.autoScore, manual_score: null },
      ]),
    );
    allItems = buildItemResults(quizQuestions, round1Map);
    const nextStatus = statusAfterRound1(allItems);
    const { error: assignStatusError } = await sb
      .from('assignments')
      .update({ status: nextStatus })
      .eq('id', parsed.data.assignmentId);
    if (assignStatusError) {
      return { ok: false, error: assignmentErrorMessage(assignStatusError) };
    }
  } else {
    const round2Map = new Map(
      processedResponses.map((p) => [p.questionId, { auto_score: p.autoScore }]),
    );
    allItems = buildItemResults(quizQuestions, r1Responses, round2Map);
  }

  const attemptScore = totalOutOf10(allItems);
  const { error: scoreError } = await sb
    .from('attempts')
    .update({ score: attemptScore })
    .eq('id', attemptRow.id);

  if (scoreError) {
    return { ok: false, error: assignmentErrorMessage(scoreError) };
  }

  revalidatePath(PATHS.kid.root);
  revalidatePath(PATHS.kid.assignment(parsed.data.assignmentId));

  return { ok: true };
}

export async function skipRetry(_: ActionState, fd: FormData): Promise<ActionState> {
  const kid = await getCurrentKid();
  if (!kid) return { ok: false, error: 'Phiên làm bài đã hết' };

  const assignmentId = String(fd.get('assignmentId') ?? '');
  if (!assignmentId) return { ok: false, error: 'Thiếu mã bài' };

  const sb = await createClient();
  const { data, error: loadError } = await sb
    .from('assignments')
    .select(
      `
      id,
      kid_id,
      quizzes!assignments_quiz_id_fkey(
        quiz_questions(
          position,
          points,
          question_id
        )
      ),
      attempts(
        id,
        round,
        score,
        submitted_at,
        responses(
          id,
          question_id,
          auto_score,
          manual_score
        )
      )
    `,
    )
    .eq('id', assignmentId)
    .maybeSingle();

  if (loadError || !data) {
    return { ok: false, error: assignmentErrorMessage(loadError ?? {}) };
  }

  const assignment = data as unknown as AssignmentLoadRow;
  if (assignment.kid_id !== kid.id) {
    return { ok: false, error: 'Bài không thuộc về bé' };
  }

  const quiz = Array.isArray(assignment.quizzes) ? assignment.quizzes[0] : assignment.quizzes;
  const quizQuestions = (quiz?.quiz_questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);

  const attempts = assignment.attempts ?? [];
  const round1Attempt = attempts.find((a) => a.round === 1);
  const round2Attempt = attempts.find((a) => a.round === 2);

  const r1Responses = new Map((round1Attempt?.responses ?? []).map((r) => [r.question_id, r]));
  const r1Items = buildItemResults(quizQuestions, r1Responses);
  const retries = retryQuestionIds(r1Items);

  const step = nextStep({
    round1Submitted: Boolean(round1Attempt && round1Attempt.submitted_at),
    round2Submitted: Boolean(round2Attempt && round2Attempt.submitted_at),
    retryCount: retries.length,
  });

  if (step !== 'play2') {
    return { ok: false, error: 'Bài đã nộp' };
  }

  const r1Score = round1Attempt?.score ?? totalOutOf10(r1Items);
  const now = new Date().toISOString();

  const { error: insertError } = await sb.from('attempts').insert({
    assignment_id: assignmentId,
    round: 2,
    started_at: now,
    submitted_at: now,
    score: r1Score,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return { ok: false, error: 'Bài đã nộp' };
    }
    return { ok: false, error: assignmentErrorMessage(insertError) };
  }

  revalidatePath(PATHS.kid.root);
  revalidatePath(PATHS.kid.assignment(assignmentId));

  return { ok: true };
}
