import type { GradeResult } from '@/core/plugins';
import type { McqAnswer, McqContent, McqResponse } from './schema';

function sameSet(left: number[], right: number[]) {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size !== b.size) return false;
  for (const index of a) if (!b.has(index)) return false;
  return true;
}

export function grade(_content: McqContent, answer: McqAnswer, response: McqResponse): GradeResult {
  return {
    score: sameSet(answer.correct, response.selected) ? 1 : 0,
    needsManual: false,
  };
}
