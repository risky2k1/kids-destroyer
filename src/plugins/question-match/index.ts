import type { QuestionTypePlugin } from '@/core/plugins';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  matchAnswer,
  matchAnswerFor,
  matchContent,
  matchResponse,
  type MatchAnswer,
  type MatchContent,
  type MatchResponse,
} from './schema';

export const matchPlugin: QuestionTypePlugin<MatchContent, MatchAnswer, MatchResponse> = {
  id: 'match',
  name: 'Ghép cặp',
  description: 'Ghép các cặp tương ứng ở hai vế.',
  contentSchema: matchContent,
  answerSchema: matchAnswer,
  responseSchema: matchResponse,
  emptyContent: { left: ['', ''], right: ['', ''] },
  emptyAnswer: { pairs: [0, 1] },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer(content, answer) {
    if (content.left.length !== content.right.length) {
      return 'Số lượng hai vế không bằng nhau';
    }
    const parsed = matchAnswerFor(content).safeParse(answer);
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? 'Đáp án không hợp lệ');
  },
};
