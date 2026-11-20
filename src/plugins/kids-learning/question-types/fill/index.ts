import type { QuestionTypePlugin } from '@/plugins/kids-learning/question-types';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  fillAnswer,
  fillContent,
  fillResponse,
  type FillAnswer,
  type FillContent,
  type FillResponse,
} from './schema';

export const fillPlugin: QuestionTypePlugin<FillContent, FillAnswer, FillResponse> = {
  id: 'fill',
  name: 'Điền chỗ trống',
  description: 'Điền từ vào các chỗ trống trong câu.',
  contentSchema: fillContent,
  answerSchema: fillAnswer,
  responseSchema: fillResponse,
  emptyContent: { text: '' },
  emptyAnswer: { blanks: [] },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer(content, answer) {
    const count = content.text.split('[[]]').length - 1;
    if (count < 1) return 'Cần ít nhất một chỗ trống [[...]]';
    if (answer.blanks.length !== count) return 'Số chỗ trống không khớp';
    return null;
  },
};
