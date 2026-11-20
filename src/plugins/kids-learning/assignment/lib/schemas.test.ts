import { describe, expect, it } from 'vitest';
import { assignInput, reviewInput, submitInput } from './schemas';

const UUID = '11111111-1111-4111-8111-111111111111';
const UUID2 = '22222222-2222-4222-8222-222222222222';

describe('assignment schemas', () => {
  it('requires at least one kid', () => {
    expect(assignInput.safeParse({ quizId: UUID, kidIds: [] }).success).toBe(false);
    const empty = assignInput.safeParse({ quizId: UUID, kidIds: [] });
    if (!empty.success) {
      expect(empty.error.issues.some((issue) => issue.message === 'Chọn ít nhất 1 bé')).toBe(true);
    }
  });

  it('turns a datetime-local due date into a Date and blank into null', () => {
    const parsed = assignInput.parse({
      quizId: UUID,
      kidIds: [UUID2],
      dueAt: '2026-11-18T18:50',
    });
    expect(parsed.dueAt).toEqual(new Date('2026-11-18T18:50'));
    expect(assignInput.parse({ quizId: UUID, kidIds: [UUID2], dueAt: '' }).dueAt).toBeNull();
    expect(assignInput.parse({ quizId: UUID, kidIds: [UUID2] }).dueAt).toBeNull();
  });

  it('accepts round 1 or 2 and a map of responses', () => {
    expect(
      submitInput.parse({
        assignmentId: UUID,
        round: 1,
        responses: { [UUID2]: { choice: 0 } },
      }).round,
    ).toBe(1);
    expect(submitInput.safeParse({ assignmentId: UUID, round: 3, responses: {} }).success).toBe(
      false,
    );
  });

  it('caps review comment and feedback length', () => {
    expect(
      reviewInput.safeParse({
        assignmentId: UUID,
        comment: 'x'.repeat(1001),
        items: [],
      }).success,
    ).toBe(false);
    expect(
      reviewInput.parse({
        assignmentId: UUID,
        items: [{ responseId: UUID2, manual: 0.5, feedback: ' ổn ' }],
      }),
    ).toEqual({
      assignmentId: UUID,
      comment: null,
      items: [{ responseId: UUID2, manual: 0.5, feedback: 'ổn' }],
    });
  });
});
