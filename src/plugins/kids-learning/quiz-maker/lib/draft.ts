import { getPlugin } from '@/plugins/kids-learning/question-types';

export type DraftItem = { type: string; prompt: string; content: unknown; answer: unknown };

function parsedJson(value: unknown): { ok: true; value: unknown } | { ok: false } {
  if (typeof value !== 'string') return { ok: true, value };
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
}

export function validateDraftItems(
  raw: unknown,
  allowedTypes: string[],
): { items: DraftItem[]; dropped: number } {
  if (!Array.isArray(raw)) return { items: [], dropped: 0 };
  const items: DraftItem[] = [];
  let dropped = 0;
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      dropped += 1;
      continue;
    }
    const row = entry as { type?: unknown; prompt?: unknown; content?: unknown; answer?: unknown };
    const prompt = typeof row.prompt === 'string' ? row.prompt.trim() : '';
    if (
      typeof row.type !== 'string' ||
      !allowedTypes.includes(row.type) ||
      prompt.length < 1 ||
      prompt.length > 500
    ) {
      dropped += 1;
      continue;
    }
    const plugin = getPlugin(row.type);
    const contentRaw = parsedJson(row.content);
    const answerRaw = parsedJson(row.answer);
    if (!plugin || !contentRaw.ok || !answerRaw.ok) {
      dropped += 1;
      continue;
    }
    const content = plugin.contentSchema.safeParse(contentRaw.value);
    const answer = content.success ? plugin.answerSchema.safeParse(answerRaw.value) : null;
    if (!content.success || !answer?.success) {
      dropped += 1;
      continue;
    }
    const cross = plugin.validateAnswer?.(content.data, answer.data);
    if (cross) {
      dropped += 1;
      continue;
    }
    items.push({ type: row.type, prompt, content: content.data, answer: answer.data });
  }
  return { items, dropped };
}
