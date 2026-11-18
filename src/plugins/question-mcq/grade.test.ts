import { describe, expect, it } from 'vitest';
import { grade } from './grade';
import { mcqAnswerFor } from './schema';

describe('mcq', () => {
  it('scores a matching set as 1 regardless of order', () => {
    expect(
      grade(
        { options: ['a', 'b', 'c'], multiple: true },
        { correct: [0, 2] },
        { selected: [2, 0] },
      ),
    ).toEqual({ score: 1, needsManual: false });
  });

  it('scores a partial selection as 0', () => {
    expect(
      grade({ options: ['a', 'b', 'c'], multiple: true }, { correct: [0, 2] }, { selected: [0] })
        .score,
    ).toBe(0);
  });

  it('rejects two correct indices on a single-choice question', () => {
    expect(
      mcqAnswerFor({ options: ['a', 'b'], multiple: false }).safeParse({ correct: [0, 1] }).success,
    ).toBe(false);
  });
});
