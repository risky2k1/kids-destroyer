import { describe, expect, it } from 'vitest';
import { grade } from './grade';
import { essayAnswer, essayContent, essayResponse } from './schema';

describe('question-essay grade and schema', () => {
  const content = { minWords: 10 };
  const answer = { sample: 'Gợi ý: Cần nêu ít nhất 3 ý chính.' };

  it('always returns score 0 and needsManual true', () => {
    const result = grade(content, answer, { text: 'Đây là bài văn của em.' });
    expect(result).toEqual({ score: 0, needsManual: true });
  });

  describe('essayContent validation', () => {
    it('accepts valid minWords (0..200)', () => {
      expect(essayContent.safeParse({ minWords: 0 }).success).toBe(true);
      expect(essayContent.safeParse({ minWords: 100 }).success).toBe(true);
      expect(essayContent.safeParse({ minWords: 200 }).success).toBe(true);
    });

    it('rejects negative minWords or > 200', () => {
      expect(essayContent.safeParse({ minWords: -1 }).success).toBe(false);
      expect(essayContent.safeParse({ minWords: 201 }).success).toBe(false);
    });
  });

  describe('essayAnswer validation', () => {
    it('accepts empty or valid sample', () => {
      expect(essayAnswer.safeParse({ sample: '' }).success).toBe(true);
      expect(essayAnswer.safeParse({ sample: 'Bài mẫu'.repeat(100) }).success).toBe(true);
    });

    it('rejects sample longer than 2000 characters', () => {
      expect(essayAnswer.safeParse({ sample: 'x'.repeat(2001) }).success).toBe(false);
    });
  });

  describe('essayResponse validation', () => {
    it('accepts valid kid text response', () => {
      expect(essayResponse.safeParse({ text: 'Em rất thích mùa thu.' }).success).toBe(true);
    });

    it('rejects empty or whitespace-only text', () => {
      expect(essayResponse.safeParse({ text: '' }).success).toBe(false);
      expect(essayResponse.safeParse({ text: '    ' }).success).toBe(false);
    });

    it('rejects text longer than 2000 characters', () => {
      expect(essayResponse.safeParse({ text: 'a'.repeat(2001) }).success).toBe(false);
    });
  });
});
