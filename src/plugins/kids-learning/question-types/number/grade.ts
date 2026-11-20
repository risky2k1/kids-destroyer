import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { NumberAnswer, NumberContent, NumberResponse } from './schema';

export function grade(
  _content: NumberContent,
  answer: NumberAnswer,
  response: NumberResponse,
): GradeResult {
  const ok = Math.abs(response.value - answer.value) <= answer.tolerance;
  return { score: ok ? 1 : 0, needsManual: false };
}
