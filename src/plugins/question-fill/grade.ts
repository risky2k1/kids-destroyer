import type { GradeResult } from '@/core/plugins';
import { normalizeFill } from './lib/normalize';
import type { FillAnswer, FillContent, FillResponse } from './schema';

export function grade(
  _content: FillContent,
  answer: FillAnswer,
  response: FillResponse,
): GradeResult {
  const total = answer.blanks.length;
  if (total === 0) return { score: 0, needsManual: false };
  let hit = 0;
  for (let i = 0; i < total; i++) {
    const value = normalizeFill(response.values[i] ?? '');
    if (value === '') continue;
    const accepted = answer.blanks[i] ?? [];
    if (accepted.some((option) => normalizeFill(option) === value)) hit += 1;
  }
  return { score: hit / total, needsManual: false };
}
