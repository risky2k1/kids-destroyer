'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/core/actions';
import { requireUser } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';
import { assignmentErrorMessage } from './lib/errors';
import { assignInput, reviewInput } from './lib/schemas';
import { totalOutOf10, type ItemResult } from './lib/scoring';

export async function assign(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = assignInput.safeParse({
    quizId: fd.get('quizId'),
    kidIds: fd.getAll('kidIds'),
    dueAt: fd.get('dueAt'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const sb = await createClient();
  const rows = parsed.data.kidIds.map((kidId) => ({
    quiz_id: parsed.data.quizId,
    kid_id: kidId,
    due_at: parsed.data.dueAt ? parsed.data.dueAt.toISOString() : null,
    status: 'assigned' as const,
  }));

  const { error } = await sb.from('assignments').insert(rows);
  if (error) return { ok: false, error: assignmentErrorMessage(error) };

  revalidatePath(PATHS.admin.assignments);
  revalidatePath(PATHS.parent.root);
  return { ok: true };
}

export async function deleteAssignment(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Thiếu mã bài' };

  const sb = await createClient();
  const { data: attempts, error: attemptsError } = await sb
    .from('attempts')
    .select('id')
    .eq('assignment_id', id)
    .limit(1);

  if (attemptsError) return { ok: false, error: assignmentErrorMessage(attemptsError) };
  if ((attempts ?? []).length > 0) {
    return { ok: false, error: 'Bài đã có lần làm, không xóa được' };
  }

  const { error } = await sb.from('assignments').delete().eq('id', id);
  if (error) return { ok: false, error: assignmentErrorMessage(error) };

  revalidatePath(PATHS.admin.assignments);
  revalidatePath(PATHS.parent.root);

  const basePath = fd.get('basePath');
  if (basePath === 'parent') {
    redirect(PATHS.parent.root);
  } else if (basePath === 'admin') {
    redirect(PATHS.admin.assignments);
  }

  return { ok: true };
}

type AssignmentQuizRel = {
  quiz_questions:
    | {
        points: number;
        question_id: string;
      }[]
    | null;
};

export async function saveReview(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();

  let itemsRaw: unknown = [];
  try {
    itemsRaw = JSON.parse(String(fd.get('items') ?? '[]'));
  } catch {
    return { ok: false, error: 'Dữ liệu chấm không hợp lệ' };
  }

  const parsed = reviewInput.safeParse({
    assignmentId: fd.get('assignmentId'),
    comment: fd.get('comment'),
    items: itemsRaw,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const sb = await createClient();

  for (const item of parsed.data.items) {
    const { error } = await sb
      .from('responses')
      .update({
        manual_score: item.manual,
        feedback: item.feedback,
      })
      .eq('id', item.responseId);
    if (error) return { ok: false, error: assignmentErrorMessage(error) };
  }

  const { data: assignment, error: loadError } = await sb
    .from('assignments')
    .select(
      `
      id,
      quiz_id,
      attempts(
        id,
        round,
        responses(
          id,
          question_id,
          response,
          auto_score,
          manual_score
        )
      ),
      quizzes!assignments_quiz_id_fkey(
        quiz_questions(
          points,
          question_id
        )
      )
    `,
    )
    .eq('id', parsed.data.assignmentId)
    .single();

  if (loadError || !assignment) {
    return { ok: false, error: assignmentErrorMessage(loadError ?? {}) };
  }

  const attempts = assignment.attempts ?? [];
  const round1 = attempts.find((a) => a.round === 1);
  const round2 = attempts.find((a) => a.round === 2);
  const r1Responses = new Map((round1?.responses ?? []).map((r) => [r.question_id, r]));
  const r2Responses = new Map((round2?.responses ?? []).map((r) => [r.question_id, r]));

  const quizRel = assignment.quizzes as unknown as AssignmentQuizRel | AssignmentQuizRel[] | null;
  const quizObj = Array.isArray(quizRel) ? quizRel[0] : quizRel;
  const quizQuestions = quizObj?.quiz_questions ?? [];

  const itemResults: ItemResult[] = quizQuestions.map((qq) => {
    const r1 = r1Responses.get(qq.question_id);
    const r2 = r2Responses.get(qq.question_id);
    // submitRound leaves auto_score null exactly for questions a person must mark.
    const needsManual = r1 !== undefined && r1.auto_score === null;

    return {
      questionId: qq.question_id,
      points: Number(qq.points),
      needsManual,
      r1:
        r1?.auto_score !== null && r1?.auto_score !== undefined ? Number(r1.auto_score) : undefined,
      r2:
        r2?.auto_score !== null && r2?.auto_score !== undefined ? Number(r2.auto_score) : undefined,
      manual:
        r1?.manual_score !== null && r1?.manual_score !== undefined
          ? Number(r1.manual_score)
          : null,
    };
  });

  const hasUngradedManual = itemResults.some(
    (item) => item.needsManual && (item.manual === null || item.manual === undefined),
  );
  const nextStatus = hasUngradedManual ? 'submitted' : 'reviewed';

  const { error: updateAssignError } = await sb
    .from('assignments')
    .update({
      parent_comment: parsed.data.comment,
      status: nextStatus,
    })
    .eq('id', parsed.data.assignmentId);
  if (updateAssignError) return { ok: false, error: assignmentErrorMessage(updateAssignError) };

  const newScore = totalOutOf10(itemResults);
  const sortedAttempts = attempts.slice().sort((a, b) => b.round - a.round);
  const latestAttempt = sortedAttempts[0];
  if (latestAttempt) {
    const { error: updateAttemptError } = await sb
      .from('attempts')
      .update({ score: newScore })
      .eq('id', latestAttempt.id);
    if (updateAttemptError) return { ok: false, error: assignmentErrorMessage(updateAttemptError) };
  }

  revalidatePath(PATHS.admin.assignments);
  revalidatePath(PATHS.admin.assignment(parsed.data.assignmentId));
  revalidatePath(PATHS.parent.root);
  revalidatePath(PATHS.parent.assignment(parsed.data.assignmentId));

  return { ok: true };
}
