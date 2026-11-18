import type { QuestionTypePlugin } from '@/core/plugins';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  mcqAnswer,
  mcqAnswerFor,
  mcqContent,
  mcqResponse,
  type McqAnswer,
  type McqContent,
  type McqResponse,
} from './schema';

export const mcqPlugin: QuestionTypePlugin<McqContent, McqAnswer, McqResponse> = {
  id: 'mcq',
  name: 'Trắc nghiệm',
  description: 'Chọn một hoặc nhiều đáp án.',
  contentSchema: mcqContent,
  answerSchema: mcqAnswer,
  responseSchema: mcqResponse,
  emptyContent: { options: ['', ''], multiple: false },
  emptyAnswer: { correct: [0] },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer(content, answer) {
    const parsed = mcqAnswerFor(content).safeParse(answer);
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? 'Đáp án không hợp lệ');
  },
};
