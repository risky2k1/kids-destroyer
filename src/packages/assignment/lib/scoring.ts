export type ItemResult = {
  questionId: string;
  points: number;
  needsManual: boolean;
  r1?: number;
  r2?: number;
  manual?: number | null;
};

/** 0..1 for one question: manual score, or the better of the two auto rounds. */
export function itemScore(item: ItemResult): number {
  if (item.needsManual) return item.manual ?? 0;
  return Math.max(item.r1 ?? 0, item.r2 ?? 0);
}

/** Quiz score on a 10-point scale, rounded to one decimal. No items → 0. */
export function totalOutOf10(items: ItemResult[]): number {
  const points = items.reduce((sum, item) => sum + item.points, 0);
  if (points === 0) return 0;
  const earned = items.reduce((sum, item) => sum + itemScore(item) * item.points, 0);
  return Math.round((earned / points) * 100) / 10;
}

/** Auto-graded questions that were answered and not perfect on round 1. */
export function retryQuestionIds(items: ItemResult[]): string[] {
  return items
    .filter((item) => !item.needsManual && item.r1 !== undefined && item.r1 < 1)
    .map((item) => item.questionId);
}

/** Round 1 leaves the assignment waiting only when a question still needs a person. */
export function statusAfterRound1(items: ItemResult[]): 'submitted' | 'reviewed' {
  return items.some((item) => item.needsManual) ? 'submitted' : 'reviewed';
}

export function canReveal(state: {
  round1Submitted: boolean;
  round2Submitted: boolean;
  retryCount: number;
}): boolean {
  return state.round2Submitted || (state.round1Submitted && state.retryCount === 0);
}

export function nextStep(state: {
  round1Submitted: boolean;
  round2Submitted: boolean;
  retryCount: number;
}): 'play1' | 'play2' | 'done' {
  if (!state.round1Submitted) return 'play1';
  if (state.round2Submitted || state.retryCount === 0) return 'done';
  return 'play2';
}

/** Builds ItemResult array from quiz questions and attempt responses. */
export function buildItemResults(
  quizQuestions: { question_id: string; points: number }[],
  r1Responses: Map<string, { auto_score: number | null; manual_score?: number | null }>,
  r2Responses?: Map<string, { auto_score: number | null }>,
): ItemResult[] {
  return quizQuestions.map((qq) => {
    const r1 = r1Responses.get(qq.question_id);
    const r2 = r2Responses?.get(qq.question_id);
    // submitRound leaves auto_score null exactly for questions a person must mark.
    const needsManual = r1 !== undefined && r1.auto_score === null;
    return {
      questionId: qq.question_id,
      points: Number(qq.points),
      needsManual,
      r1:
        r1?.auto_score !== null && r1?.auto_score !== undefined ? Number(r1.auto_score) : undefined,
      r2:
        r2?.auto_score !== null && r2?.auto_score !== undefined ? Number(r2.auto_score) : undefined,
      manual:
        r1?.manual_score !== null && r1?.manual_score !== undefined
          ? Number(r1.manual_score)
          : null,
    };
  });
}
