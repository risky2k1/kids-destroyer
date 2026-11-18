import { describe, expect, it } from 'vitest';
import { quizInput } from './schemas';

const subjectId = '550e8400-e29b-41d4-a716-446655440000';
const gradeId = '550e8400-e29b-41d4-a716-446655440001';
const questionId = '550e8400-e29b-41d4-a716-446655440002';

describe('quizInput', () => {
  it('accepts a quiz with one question', () => {
    expect(
      quizInput.parse({
        title: ' Ôn tập ',
        subjectId,
        gradeId,
        items: [{ questionId, points: 1 }],
      }).title,
    ).toBe('Ôn tập');
  });

  it('rejects an empty quiz', () => {
    const parsed = quizInput.safeParse({ title: 'Đề 1', subjectId, gradeId, items: [] });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0].message).toBe('Đề cần ít nhất 1 câu');
  });

  it('rejects a duplicated question', () => {
    const parsed = quizInput.safeParse({
      title: 'Đề 1',
      subjectId,
      gradeId,
      items: [
        { questionId, points: 1 },
        { questionId, points: 2 },
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.message === 'Câu bị trùng')).toBe(true);
  });
});
