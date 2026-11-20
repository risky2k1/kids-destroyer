import { describe, expect, it } from 'vitest';
import { grade } from './grade';
import { scramble } from './lib/scramble';
import { matchAnswerFor, matchResponse } from './schema';

describe('question-match grade, scramble, and schema', () => {
  const content = {
    left: ['Chó', 'Mèo', 'Vịt', 'Bò'],
    right: ['Cạp cạp', 'Gâu gâu', 'Úm bò', 'Meo meo'],
  };
  // Chó -> Gâu gâu (1), Mèo -> Meo meo (3), Vịt -> Cạp cạp (0), Bò -> Úm bò (2)
  const answer = { pairs: [1, 3, 0, 2] };

  describe('grade', () => {
    it('scores 1 for all correct pairs', () => {
      const result = grade(content, answer, { pairs: [1, 3, 0, 2] });
      expect(result).toEqual({ score: 1, needsManual: false });
    });

    it('scores partial credit (2/4 = 0.5)', () => {
      const result = grade(content, answer, { pairs: [1, 3, null, null] });
      expect(result.score).toBe(0.5);
      expect(result.needsManual).toBe(false);
    });

    it('scores partial credit (1/4 = 0.25)', () => {
      const result = grade(content, answer, { pairs: [1, 0, 2, 3] });
      expect(result.score).toBe(0.25);
    });

    it('scores 0 when none match or all null', () => {
      const result = grade(content, answer, { pairs: [null, null, null, null] });
      expect(result.score).toBe(0);
    });

    it('scores 0 for length mismatch', () => {
      const result = grade(content, answer, { pairs: [1, 3] });
      expect(result.score).toBe(0);
    });
  });

  describe('scramble', () => {
    it('scrambles right items and correctly maps pairs', () => {
      const originalRight = ['Dog', 'Cat', 'Duck'];
      const { items: scrambledRight, order } = scramble(originalRight);

      expect(scrambledRight).toHaveLength(originalRight.length);
      expect([...scrambledRight].sort()).toEqual([...originalRight].sort());
      // Reconstructed matches original
      const reconstructed = order.map((idx) => scrambledRight[idx]);
      expect(reconstructed).toEqual(originalRight);
    });
  });

  describe('matchAnswerFor', () => {
    it('accepts valid pairs', () => {
      expect(matchAnswerFor(content).safeParse(answer).success).toBe(true);
    });

    it('rejects out-of-range right index', () => {
      expect(matchAnswerFor(content).safeParse({ pairs: [1, 3, 0, 4] }).success).toBe(false);
    });

    it('rejects negative index', () => {
      expect(matchAnswerFor(content).safeParse({ pairs: [1, -1, 0, 2] }).success).toBe(false);
    });

    it('rejects mismatched length', () => {
      expect(matchAnswerFor(content).safeParse({ pairs: [1, 3, 0] }).success).toBe(false);
    });
  });

  describe('matchResponse validation', () => {
    it('accepts valid pairs including nulls', () => {
      expect(matchResponse.safeParse({ pairs: [0, null, 2] }).success).toBe(true);
    });

    it('rejects length < 2 or > 6', () => {
      expect(matchResponse.safeParse({ pairs: [0] }).success).toBe(false);
      expect(matchResponse.safeParse({ pairs: [0, 1, 2, 3, 4, 5, 0] }).success).toBe(false);
    });

    it('rejects negative index', () => {
      expect(matchResponse.safeParse({ pairs: [-1, 0] }).success).toBe(false);
    });

    it('rejects index > 5', () => {
      expect(matchResponse.safeParse({ pairs: [0, 6] }).success).toBe(false);
    });

    it('rejects non-integer index', () => {
      expect(matchResponse.safeParse({ pairs: [0, 1.2] }).success).toBe(false);
    });
  });
});
