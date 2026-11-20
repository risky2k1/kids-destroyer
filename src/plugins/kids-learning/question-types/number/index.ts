import type { QuestionTypePlugin } from '@/plugins/kids-learning/question-types';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  numberAnswer,
  numberContent,
  numberResponse,
  type NumberAnswer,
  type NumberContent,
  type NumberResponse,
} from './schema';

export const numberPlugin: QuestionTypePlugin<NumberContent, NumberAnswer, NumberResponse> = {
  id: 'number',
  name: 'Nhập số',
  description: 'Nhập một số, có thể kèm đơn vị và sai số.',
  contentSchema: numberContent,
  answerSchema: numberAnswer,
  responseSchema: numberResponse,
  emptyContent: {},
  emptyAnswer: { value: 0, tolerance: 0 },
  Editor,
  Player,
  Review,
  grade,
};
