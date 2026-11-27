'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requireAnyPermission, requirePermission } from '@/core/auth/session';
import { enabledMap } from '@/plugins/kids-learning/question-types/server';
import { AUTHOR_QUESTION, areaPaths, readArea } from '@/plugins/kids-learning/quiz';
import { PATHS } from '@/core/routes';
import type { Json } from '@/core/supabase/database.types';
import { createClient } from '@/core/supabase/server';
import { getPlugin, PLUGIN_IDS } from '@/plugins/kids-learning/question-types';
import { questionErrorMessage } from './lib/errors';
import { isQuestionLocked } from './lib/lock';
import { questionMeta } from './lib/schemas';

const optionalId = z.uuid();

function readMeta(fd: FormData) {
  const topic = fd.get('topicId');
  return questionMeta.safeParse({
    type: fd.get('type'),
    subjectId: fd.get('subjectId'),
    gradeId: fd.get('gradeId'),
    topicId: topic ? topic : null,
    lang: fd.get('lang'),
    prompt: fd.get('prompt'),
  });
}

function readJson(fd: FormData, key: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(String(fd.get(key) ?? '')) };
  } catch {
    return { ok: false };
  }
}

function dbError(err: unknown): ActionState {
  const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : undefined;
  return { ok: false, error: questionErrorMessage({ code }) };
}

async function locked(sb: Awaited<ReturnType<typeof createClient>>, id: string) {
  try {
    return await isQuestionLocked(sb, id);
  } catch (err) {
    return dbError(err);
  }
}

const OWN_ROW = 'Bạn chỉ sửa được đề/câu của mình';

function refresh(fd: FormData, id?: string) {
  const paths = areaPaths(readArea(fd));
  revalidatePath(paths.questions);
  revalidatePath(PATHS.admin.plugins);
  if (id) revalidatePath(paths.question(id));
}

export async function saveQuestion(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUESTION);
  const meta = readMeta(fd);
  if (!meta.success) return { ok: false, error: meta.error.issues[0].message };
  const plugin = getPlugin(meta.data.type);
  if (!plugin) return { ok: false, error: 'Dạng câu không tồn tại' };

  const contentJson = readJson(fd, 'content');
  const answerJson = readJson(fd, 'answer');
  if (!contentJson.ok || !answerJson.ok) return { ok: false, error: 'Nội dung không hợp lệ' };
  const content = plugin.contentSchema.safeParse(contentJson.value);
  if (!content.success) {
    return { ok: false, error: content.error.issues[0]?.message ?? 'Nội dung không hợp lệ' };
  }
  const answer = plugin.answerSchema.safeParse(answerJson.value);
  if (!answer.success) {
    return { ok: false, error: answer.error.issues[0]?.message ?? 'Đáp án không hợp lệ' };
  }
  const cross = plugin.validateAnswer?.(content.data, answer.data);
  if (cross) return { ok: false, error: cross };

  const id = optionalId.safeParse(fd.get('id'));
  const sb = await createClient();
  const row = {
    type: meta.data.type,
    subject_id: meta.data.subjectId,
    grade_id: meta.data.gradeId,
    topic_id: meta.data.topicId ?? null,
    lang: meta.data.lang,
    prompt: meta.data.prompt,
    content: content.data as NonNullable<Json>,
    answer: answer.data as NonNullable<Json>,
  };

  if (!id.success) {
    const map = await enabledMap();
    if (map[meta.data.type] === false) return { ok: false, error: 'Dạng câu đang tắt' };
    const inserted = await sb.from('questions').insert(row).select('id').single();
    if (inserted.error || !inserted.data)
      return { ok: false, error: questionErrorMessage(inserted.error) };
    refresh(fd);
    redirect(areaPaths(readArea(fd)).question(inserted.data.id));
  }

  const gate = await locked(sb, id.data);
  if (gate === true) return { ok: false, error: 'Câu đã được giao, không sửa được' };
  if (gate && typeof gate === 'object') return gate;
  const existing = await sb.from('questions').select('type').eq('id', id.data).maybeSingle();
  if (existing.error) return { ok: false, error: questionErrorMessage(existing.error) };
  if (!existing.data) return { ok: false, error: 'Không tìm thấy câu' };
  if (existing.data.type !== meta.data.type) return { ok: false, error: 'Không đổi được dạng câu' };
  const updated = await sb.from('questions').update(row).eq('id', id.data).select('id');
  if (updated.error) return { ok: false, error: questionErrorMessage(updated.error) };
  if ((updated.data ?? []).length === 0) return { ok: false, error: OWN_ROW };
  refresh(fd, id.data);
  return { ok: true };
}

export async function archiveQuestion(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUESTION);
  const id = optionalId.safeParse(fd.get('id'));
  if (!id.success) return { ok: false, error: 'Có lỗi, thử lại' };
  const sb = await createClient();
  const gate = await locked(sb, id.data);
  if (gate === true) return { ok: false, error: 'Câu đã được giao, không lưu trữ được' };
  if (gate && typeof gate === 'object') return gate;
  const archived = await sb
    .from('questions')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id.data)
    .select('id');
  if (archived.error) return { ok: false, error: questionErrorMessage(archived.error) };
  if ((archived.data ?? []).length === 0) return { ok: false, error: OWN_ROW };
  refresh(fd, id.data);
  redirect(areaPaths(readArea(fd)).questions);
}

export async function duplicateQuestion(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAnyPermission(AUTHOR_QUESTION);
  const id = optionalId.safeParse(fd.get('id'));
  if (!id.success) return { ok: false, error: 'Có lỗi, thử lại' };
  const sb = await createClient();
  const existing = await sb
    .from('questions')
    .select('type, subject_id, grade_id, topic_id, lang, prompt, content, answer')
    .eq('id', id.data)
    .maybeSingle();
  if (existing.error) return { ok: false, error: questionErrorMessage(existing.error) };
  if (!existing.data) return { ok: false, error: 'Không tìm thấy câu' };
  const map = await enabledMap();
  if (map[existing.data.type] === false) return { ok: false, error: 'Dạng câu đang tắt' };
  const prompt = `(bản sao) ${existing.data.prompt}`.slice(0, 500);
  const inserted = await sb
    .from('questions')
    .insert({ ...existing.data, prompt })
    .select('id')
    .single();
  if (inserted.error || !inserted.data)
    return { ok: false, error: questionErrorMessage(inserted.error) };
  refresh(fd);
  redirect(areaPaths(readArea(fd)).question(inserted.data.id));
}

export async function setPluginEnabled(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission('plugins.manage');
  const id = z.string().safeParse(fd.get('id'));
  if (!id.success || !PLUGIN_IDS.includes(id.data))
    return { ok: false, error: 'Dạng câu không tồn tại' };
  const enabled = fd.get('enabled') === 'true';
  const sb = await createClient();
  const { error } = await sb.from('plugins').upsert({ id: id.data, enabled });
  if (error) return { ok: false, error: questionErrorMessage(error) };
  revalidatePath(PATHS.admin.plugins);
  revalidatePath(PATHS.admin.questions);
  revalidatePath(PATHS.admin.newQuestion);
  return { ok: true };
}
