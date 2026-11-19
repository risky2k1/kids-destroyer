import type { QuestionTypePlugin } from '@/core/plugins';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  orderAnswer,
  orderAnswerFor,
  orderContent,
  orderResponse,
  type OrderAnswer,
  type OrderContent,
  type OrderResponse,
} from './schema';

export const orderPlugin: QuestionTypePlugin<OrderContent, OrderAnswer, OrderResponse> = {
  id: 'order',
  name: 'Sắp xếp thứ tự',
  description: 'Sắp xếp các mục theo đúng thứ tự.',
  contentSchema: orderContent,
  answerSchema: orderAnswer,
  responseSchema: orderResponse,
  emptyContent: { items: ['', ''] },
  emptyAnswer: { order: [0, 1] },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer(content, answer) {
    const parsed = orderAnswerFor(content).safeParse(answer);
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? 'Đáp án không hợp lệ');
  },
};
