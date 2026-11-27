'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import type { Json } from '@/core/supabase/database.types';
import { createClient } from '@/core/supabase/server';
import { isOwnImagePath } from '@/plugins/kids-learning/question-bank/server';
import { enabledMap } from '@/plugins/kids-learning/question-types/server';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { validateDraftItems, type DraftItem } from './lib/draft';
import { generateJson } from './lib/gemini';
import { buildPrompt } from './lib/prompt';
import { DAILY_LIMIT, quotaLeft } from './lib/quota';
import { draftRequest } from './lib/schemas';

const AI_TYPES = ['mcq', 'fill', 'number', 'order', 'match'] as const;
const BUSY = 'AI đang bận, thử lại sau ít phút';
const BAD_DRAFT = 'AI trả về đề không dùng được, thử lại nhé';
const QUOTA = 'Hôm nay bạn đã tạo đủ 10 lần, mai thử lại nhé';

export type DraftState = ActionState & {
  draft?: { title: string; items: DraftItem[] };
  dropped?: number;
  left?: number;
};

function readRequest(fd: FormData) {
  const topic = String(fd.get('topicId') ?? '');
  return draftRequest.safeParse({
    subjectId: fd.get('subjectId'),
    gradeId: fd.get('gradeId'),
    topicId: topic ? topic : null,
    count: Number(fd.get('count') || 10),
    types: fd.getAll('types'),
    lang: fd.get('lang'),
    note: fd.get('note') ?? '',
  });
}

export async function generateQuizDraft(_: DraftState, fd: FormData): Promise<DraftState> {
  const user = await requirePermission('quizzes.author');
  const parsed = readRequest(fd);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Thiếu thông tin' };
  const map = await enabledMap();
  const types = parsed.data.types.filter((type) => map[type] !== false);
  if (types.length === 0) return { ok: false, error: 'Chọn ít nhất một dạng câu đang bật' };

  const sb = await createClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const history = await sb
    .from('ai_generations')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', since);
  if (history.error) return { ok: false, error: 'Không kiểm tra được lượt tạo' };
  const left = quotaLeft(
    (history.data ?? []).map((row) => row.created_at),
    new Date(),
  );
  if (left === 0) return { ok: false, error: QUOTA };

  const [subject, grade, topic] = await Promise.all([
    sb.from('subjects').select('name').eq('id', parsed.data.subjectId).maybeSingle(),
    sb.from('grades').select('name').eq('id', parsed.data.gradeId).maybeSingle(),
    parsed.data.topicId
      ? sb.from('topics').select('name').eq('id', parsed.data.topicId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (!subject.data || !grade.data) return { ok: false, error: 'Không tìm thấy môn hoặc lớp' };

  const prompt = buildPrompt({
    subjectName: subject.data.name,
    gradeName: grade.data.name,
    topicName: topic.data?.name ?? null,
    count: parsed.data.count,
    types,
    lang: parsed.data.lang,
    note: parsed.data.note,
  });
  const generated = await generateJson(prompt.text, prompt.responseSchema);
  if (!generated.ok) {
    return {
      ok: false,
      error: generated.reason === 'config' ? 'AI chưa được cấu hình đúng, báo quản trị viên' : BUSY,
    };
  }

  const logged = await sb.from('ai_generations').insert({});
  if (logged.error) return { ok: false, error: 'Không ghi được lượt tạo' };

  const body = generated.json as { title?: unknown; items?: unknown };
  const title =
    typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 100) : 'Đề AI';
  const checked = validateDraftItems(body.items, types);
  if (checked.items.length === 0) return { ok: false, error: BAD_DRAFT };
  return {
    ok: true,
    draft: { title, items: checked.items },
    dropped: checked.dropped,
    left: left - 1,
  };
}

type SaveItem = DraftItem & { imagePath?: string };

export async function saveDraftQuiz(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission('quizzes.author');
  const title = String(fd.get('title') ?? '')
    .trim()
    .slice(0, 100);
  const subjectId = String(fd.get('subjectId') ?? '');
  const gradeId = String(fd.get('gradeId') ?? '');
  const topicRaw = String(fd.get('topicId') ?? '');
  const topicId = topicRaw || null;
  const lang = fd.get('lang') === 'en' ? 'en' : 'vi';
  if (!title || !subjectId || !gradeId) return { ok: false, error: 'Thiếu thông tin đề' };
  let items: SaveItem[] = [];
  try {
    items = JSON.parse(String(fd.get('items') ?? '[]')) as SaveItem[];
  } catch {
    return { ok: false, error: 'Danh sách câu không hợp lệ' };
  }
  if (items.length === 0) return { ok: false, error: 'Đề cần ít nhất 1 câu' };

  const map = await enabledMap();
  const ready: SaveItem[] = [];
  for (const item of items) {
    if (!AI_TYPES.includes(item.type as (typeof AI_TYPES)[number]) || map[item.type] === false) {
      return { ok: false, error: 'Dạng câu đang tắt' };
    }
    const plugin = getPlugin(item.type);
    if (!plugin) return { ok: false, error: 'Dạng câu không tồn tại' };
    const content = plugin.contentSchema.safeParse(item.content);
    if (!content.success)
      return { ok: false, error: content.error.issues[0]?.message ?? 'Nội dung không hợp lệ' };
    const answer = plugin.answerSchema.safeParse(item.answer);
    if (!answer.success)
      return { ok: false, error: answer.error.issues[0]?.message ?? 'Đáp án không hợp lệ' };
    const cross = plugin.validateAnswer?.(content.data, answer.data);
    if (cross) return { ok: false, error: cross };
    if (item.imagePath && !isOwnImagePath(item.imagePath, user.id))
      return { ok: false, error: 'Ảnh không hợp lệ' };
    ready.push({ ...item, content: content.data, answer: answer.data });
  }

  const sb = await createClient();
  const questionIds: string[] = [];
  let quizId = '';
  const fail = async (error: string) => {
    if (quizId) await sb.from('quizzes').delete().eq('id', quizId);
    if (questionIds.length > 0) await sb.from('questions').delete().in('id', questionIds);
    return { ok: false as const, error };
  };

  for (const item of ready) {
    const inserted = await sb
      .from('questions')
      .insert({
        type: item.type,
        subject_id: subjectId,
        grade_id: gradeId,
        topic_id: topicId,
        lang,
        prompt: item.prompt,
        content: item.content as NonNullable<Json>,
        answer: item.answer as NonNullable<Json>,
        image_path: item.imagePath || null,
      })
      .select('id')
      .single();
    if (inserted.error || !inserted.data) return fail('Không lưu được câu');
    questionIds.push(inserted.data.id);
  }

  const quiz = await sb
    .from('quizzes')
    .insert({ title, subject_id: subjectId, grade_id: gradeId })
    .select('id')
    .single();
  if (quiz.error || !quiz.data) return fail('Không lưu được đề');
  quizId = quiz.data.id;
  const links = await sb.from('quiz_questions').insert(
    questionIds.map((questionId, position) => ({
      quiz_id: quizId,
      question_id: questionId,
      position,
      points: 1,
    })),
  );
  if (links.error) return fail('Không gắn được câu vào đề');

  revalidatePath(PATHS.parent.quizzes);
  redirect(PATHS.parent.quiz(quizId));
}

export { DAILY_LIMIT };
