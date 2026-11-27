'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requireAnyPermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { AUTHOR_QUIZ, areaPaths, readArea } from './lib/area';
import { quizErrorMessage } from './lib/errors';
import { isQuizLocked } from './lib/lock';
import { quizInput, type QuizInput } from './lib/schemas';

const optionalId = z.uuid();

function readInput(fd: FormData) {
  let items: unknown = [];
  try {
    items = JSON.parse(String(fd.get('items') ?? '[]'));
  } catch {
    return { ok: false as const, error: 'Danh sách câu không hợp lệ' };
  }
  const parsed = quizInput.safeParse({
    title: fd.get('title'),
    subjectId: fd.get('subjectId'),
    gradeId: fd.get('gradeId'),
    items,
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  return { ok: true as const, data: parsed.data };
}

async function replaceItems(
  sb: Awaited<ReturnType<typeof createClient>>,
  quizId: string,
  items: QuizInput['items'],
): Promise<ActionState | null> {
  const deleted = await sb.from('quiz_questions').delete().eq('quiz_id', quizId);
  if (deleted.error) return { ok: false, error: quizErrorMessage(deleted.error) };
  const inserted = await sb.from('quiz_questions').insert(
    items.map((item, position) => ({
      quiz_id: quizId,
      question_id: item.questionId,
      position,
      points: item.points,
    })),
  );
  if (inserted.error) return { ok: false, error: quizErrorMessage(inserted.error) };
  return null;
}

async function questionsMatch(
  sb: Awaited<ReturnType<typeof createClient>>,
  data: QuizInput,
): Promise<string | null> {
  const ids = data.items.map((item) => item.questionId);
  const { data: rows, error } = await sb
    .from('questions')
    .select('id, subject_id, grade_id, archived_at')
    .in('id', ids);
  if (error) return quizErrorMessage(error);
  if ((rows ?? []).length !== ids.length) return 'Có câu không còn trong ngân hàng';
  const mismatch = (rows ?? []).some(
    (row) =>
      row.archived_at !== null ||
      row.subject_id !== data.subjectId ||
      row.grade_id !== data.gradeId,
  );
  return mismatch ? 'Câu không cùng môn và lớp với đề' : null;
}

const OWN_ROW = 'Bạn chỉ sửa được đề/câu của mình';

function refresh(fd: FormData, id?: string) {
  const paths = areaPaths(readArea(fd));
  revalidatePath(paths.quizzes);
  if (id) revalidatePath(paths.quiz(id));
}

async function gateLocked(sb: Awaited<ReturnType<typeof createClient>>, id: string) {
  try {
    return await isQuizLocked(sb, id);
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : undefined;
    return { ok: false as const, error: quizErrorMessage({ code }) };
  }
}

export async function saveQuiz(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUIZ);
  const parsed = readInput(fd);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const sb = await createClient();
  const mismatch = await questionsMatch(sb, parsed.data);
  if (mismatch) return { ok: false, error: mismatch };
  const row = {
    title: parsed.data.title,
    subject_id: parsed.data.subjectId,
    grade_id: parsed.data.gradeId,
  };
  const id = optionalId.safeParse(fd.get('id'));

  if (!id.success) {
    const created = await sb.from('quizzes').insert(row).select('id').single();
    if (created.error || !created.data)
      return { ok: false, error: quizErrorMessage(created.error) };
    const failed = await replaceItems(sb, created.data.id, parsed.data.items);
    if (failed) {
      await sb.from('quizzes').delete().eq('id', created.data.id);
      return failed;
    }
    refresh(fd);
    redirect(areaPaths(readArea(fd)).quiz(created.data.id));
  }

  const gate = await gateLocked(sb, id.data);
  if (gate === true) return { ok: false, error: 'Đề đã được giao, không sửa được' };
  if (gate && typeof gate === 'object') return gate;
  const updated = await sb.from('quizzes').update(row).eq('id', id.data).select('id');
  if (updated.error) return { ok: false, error: quizErrorMessage(updated.error) };
  if ((updated.data ?? []).length === 0) return { ok: false, error: OWN_ROW };
  const failed = await replaceItems(sb, id.data, parsed.data.items);
  if (failed) return failed;
  refresh(fd, id.data);
  return { ok: true };
}

export async function archiveQuiz(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUIZ);
  const id = optionalId.safeParse(fd.get('id'));
  if (!id.success) return { ok: false, error: 'Có lỗi, thử lại' };
  const sb = await createClient();
  const gate = await gateLocked(sb, id.data);
  if (gate === true) return { ok: false, error: 'Đề đã được giao, không lưu trữ được' };
  if (gate && typeof gate === 'object') return gate;
  const archived = await sb
    .from('quizzes')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id.data)
    .select('id');
  if (archived.error) return { ok: false, error: quizErrorMessage(archived.error) };
  if ((archived.data ?? []).length === 0) return { ok: false, error: OWN_ROW };
  refresh(fd, id.data);
  redirect(areaPaths(readArea(fd)).quizzes);
}

export async function duplicateQuiz(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUIZ);
  const id = optionalId.safeParse(fd.get('id'));
  if (!id.success) return { ok: false, error: 'Có lỗi, thử lại' };
  const sb = await createClient();
  const existing = await sb
    .from('quizzes')
    .select('title, subject_id, grade_id, quiz_questions(position, points, question_id)')
    .eq('id', id.data)
    .maybeSingle();
  if (existing.error) return { ok: false, error: quizErrorMessage(existing.error) };
  if (!existing.data) return { ok: false, error: 'Không tìm thấy đề' };
  const title = `(bản sao) ${existing.data.title}`.slice(0, 100);
  const created = await sb
    .from('quizzes')
    .insert({ title, subject_id: existing.data.subject_id, grade_id: existing.data.grade_id })
    .select('id')
    .single();
  if (created.error || !created.data) return { ok: false, error: quizErrorMessage(created.error) };
  const items = (existing.data.quiz_questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ questionId: item.question_id, points: Number(item.points) }));
  if (items.length > 0) {
    const failed = await replaceItems(sb, created.data.id, items);
    if (failed) {
      await sb.from('quizzes').delete().eq('id', created.data.id);
      return failed;
    }
  }
  refresh(fd);
  redirect(areaPaths(readArea(fd)).quiz(created.data.id));
}
