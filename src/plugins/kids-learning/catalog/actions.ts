'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requireRole } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';
import { catalogErrorMessage } from './lib/errors';
import { subjectInput, topicInput } from './lib/schemas';

type Table = 'subjects' | 'grades' | 'topics';
const optionalId = z.uuid().optional().catch(undefined);

async function finish(error: { code?: string } | null): Promise<ActionState> {
  if (error) return { ok: false, error: catalogErrorMessage(error) };
  revalidatePath(PATHS.admin.catalog);
  revalidatePath(PATHS.admin.subjects);
  revalidatePath(PATHS.admin.grades);
  revalidatePath(PATHS.admin.topics);
  return { ok: true };
}

async function saveNamed(table: 'subjects' | 'grades', fd: FormData): Promise<ActionState> {
  await requireRole('admin');
  const parsed = subjectInput.safeParse({ name: fd.get('name'), sort: fd.get('sort') });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const id = optionalId.parse(fd.get('id') || undefined);
  const sb = await createClient();
  const { error } = id
    ? await sb.from(table).update(parsed.data).eq('id', id)
    : await sb.from(table).insert(parsed.data);
  return finish(error);
}

async function remove(table: Table, fd: FormData): Promise<ActionState> {
  await requireRole('admin');
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) return { ok: false, error: 'Có lỗi, thử lại' };
  const sb = await createClient();
  const { error } = await sb.from(table).delete().eq('id', id.data);
  return finish(error);
}

export const saveSubject = async (_: ActionState, fd: FormData) => saveNamed('subjects', fd);
export const saveGrade = async (_: ActionState, fd: FormData) => saveNamed('grades', fd);
export const deleteSubject = async (_: ActionState, fd: FormData) => remove('subjects', fd);
export const deleteGrade = async (_: ActionState, fd: FormData) => remove('grades', fd);
export const deleteTopic = async (_: ActionState, fd: FormData) => remove('topics', fd);

export async function saveTopic(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole('admin');
  const parsed = topicInput.safeParse({
    name: fd.get('name'),
    subjectId: fd.get('subjectId'),
    gradeId: fd.get('gradeId'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { name, subjectId, gradeId } = parsed.data;
  const row = { name, subject_id: subjectId, grade_id: gradeId };
  const id = optionalId.parse(fd.get('id') || undefined);
  const sb = await createClient();
  const { error } = id
    ? await sb.from('topics').update(row).eq('id', id)
    : await sb.from('topics').insert(row);
  return finish(error);
}
