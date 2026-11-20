import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { MatchAnswer, MatchContent, MatchResponse } from './schema';

export function grade(
  content: MatchContent,
  answer: MatchAnswer,
  response: MatchResponse,
): GradeResult {
  if (
    !response?.pairs ||
    response.pairs.length !== answer.pairs.length ||
    response.pairs.length !== content.left.length
  ) {
    return { score: 0, needsManual: false };
  }

  const total = answer.pairs.length;
  if (total === 0) {
    return { score: 0, needsManual: false };
  }

  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (response.pairs[i] !== null && response.pairs[i] === answer.pairs[i]) {
      correct++;
    }
  }

  return {
    score: correct / total,
    needsManual: false,
  };
}
