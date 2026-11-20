import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { OrderAnswer, OrderContent, OrderResponse } from './schema';

export function grade(
  content: OrderContent,
  answer: OrderAnswer,
  response: OrderResponse,
): GradeResult {
  if (
    !response?.order ||
    response.order.length !== answer.order.length ||
    response.order.length !== content.items.length
  ) {
    return { score: 0, needsManual: false };
  }

  const isExactMatch = response.order.every((val, i) => val === answer.order[i]);

  return {
    score: isExactMatch ? 1 : 0,
    needsManual: false,
  };
}
