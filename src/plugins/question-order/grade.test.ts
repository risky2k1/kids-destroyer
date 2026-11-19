import { describe, expect, it } from 'vitest';
import { grade } from './grade';
import { orderAnswerFor, orderResponse } from './schema';

describe('question-order grade and schema', () => {
  const content = { items: ['Kén', 'Bướm', 'Sâu', 'Trứng'] };
  // Suppose correct order is: Trứng (3) -> Sâu (2) -> Kén (0) -> Bướm (1)
  const answer = { order: [3, 2, 0, 1] };

  it('scores exact match as 1', () => {
    const result = grade(content, answer, { order: [3, 2, 0, 1] });
    expect(result).toEqual({ score: 1, needsManual: false });
  });

  it('scores incorrect permutation as 0', () => {
    const result = grade(content, answer, { order: [3, 2, 1, 0] });
    expect(result).toEqual({ score: 0, needsManual: false });
  });

  it('scores mismatched length as 0', () => {
    const result = grade(content, answer, { order: [3, 2, 0] });
    expect(result).toEqual({ score: 0, needsManual: false });
  });

  describe('orderAnswerFor', () => {
    it('accepts a valid permutation of content indices', () => {
      expect(orderAnswerFor(content).safeParse({ order: [3, 2, 0, 1] }).success).toBe(true);
    });

    it('rejects duplicate indices', () => {
      expect(orderAnswerFor(content).safeParse({ order: [3, 2, 0, 0] }).success).toBe(false);
    });

    it('rejects out-of-range index', () => {
      expect(orderAnswerFor(content).safeParse({ order: [3, 2, 0, 4] }).success).toBe(false);
    });

    it('rejects wrong length', () => {
      expect(orderAnswerFor(content).safeParse({ order: [3, 2] }).success).toBe(false);
    });
  });

  describe('orderResponse validation', () => {
    it('accepts valid response within bounds', () => {
      expect(orderResponse.safeParse({ order: [1, 0, 2] }).success).toBe(true);
    });

    it('rejects response with length < 2 or > 8', () => {
      expect(orderResponse.safeParse({ order: [0] }).success).toBe(false);
      expect(orderResponse.safeParse({ order: [0, 1, 2, 3, 4, 5, 6, 7, 8] }).success).toBe(false);
    });

    it('rejects negative indices', () => {
      expect(orderResponse.safeParse({ order: [-1, 0] }).success).toBe(false);
    });

    it('rejects indices > 7', () => {
      expect(orderResponse.safeParse({ order: [0, 8] }).success).toBe(false);
    });

    it('rejects duplicate indices', () => {
      expect(orderResponse.safeParse({ order: [1, 1] }).success).toBe(false);
    });

    it('rejects non-integer values', () => {
      expect(orderResponse.safeParse({ order: [1.5, 0] }).success).toBe(false);
    });
  });
});
