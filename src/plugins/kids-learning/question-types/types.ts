import type { ComponentType } from 'react';
import type { ZodType } from 'zod';

/** score is 0..1. needsManual is true for types a human still has to mark. */
export type GradeResult = { score: number; needsManual: boolean };

export interface QuestionTypePlugin<C, A, R> {
  id: string;
  name: string;
  description: string;
  contentSchema: ZodType<C>;
  answerSchema: ZodType<A>;
  responseSchema: ZodType<R>;
  emptyContent: C;
  emptyAnswer: A;
  Editor: ComponentType<{ content: C; answer: A; onChange: (content: C, answer: A) => void }>;
  Player: ComponentType<{
    content: C;
    value: R | undefined;
    onChange: (response: R) => void;
    disabled?: boolean;
  }>;
  Review: ComponentType<{
    content: C;
    answer: A;
    response: R | undefined;
    result: GradeResult | undefined;
  }>;
  grade(content: C, answer: A, response: R): GradeResult;
  /** Cross-field check once both schemas have parsed. Null means valid. */
  validateAnswer?(content: C, answer: A): string | null;
}
