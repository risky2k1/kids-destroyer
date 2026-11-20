import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { EssayAnswer, EssayContent, EssayResponse } from './schema';

export function grade(
  content: EssayContent,
  answer: EssayAnswer,
  response: EssayResponse,
): GradeResult {
  void content;
  void answer;
  void response;
  return {
    score: 0,
    needsManual: true,
  };
}
