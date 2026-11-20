import { describe, expect, it } from 'vitest';
import { gradeInput, subjectInput, topicInput } from './schemas';

describe('catalog schemas', () => {
  it('rejects empty name', () => {
    expect(subjectInput.safeParse({ name: '   ', sort: 0 }).success).toBe(false);
  });
  it('trims name', () => {
    expect(gradeInput.parse({ name: '  Lớp 2 ', sort: '2' })).toEqual({ name: 'Lớp 2', sort: 2 });
  });
  it('rejects negative sort', () => {
    expect(subjectInput.safeParse({ name: 'Toán', sort: -1 }).success).toBe(false);
  });
  it('topic needs subject and grade ids', () => {
    expect(
      topicInput.safeParse({ name: 'Cộng có nhớ', subjectId: 'x', gradeId: 'y' }).success,
    ).toBe(false);
  });
});
