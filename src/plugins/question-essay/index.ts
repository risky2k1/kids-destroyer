import type { QuestionTypePlugin } from '@/core/plugins';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  essayAnswer,
  essayContent,
  essayResponse,
  type EssayAnswer,
  type EssayContent,
  type EssayResponse,
} from './schema';

export const essayPlugin: QuestionTypePlugin<EssayContent, EssayAnswer, EssayResponse> = {
  id: 'essay',
  name: 'Viết câu / đoạn',
  description: 'Tự viết câu trả lời hoặc đoạn văn, phụ huynh chấm tay.',
  contentSchema: essayContent,
  answerSchema: essayAnswer,
  responseSchema: essayResponse,
  emptyContent: { minWords: 0 },
  emptyAnswer: { sample: '' },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer() {
    return null;
  },
};
