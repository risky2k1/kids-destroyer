import { describe, expect, it } from 'vitest';
import { kidInput, parentInput, pinSchema } from './schemas';

const uuid = '3f1c2a5e-8b7d-4c6e-9f10-112233445566';

describe('family schemas', () => {
  it('pin must be exactly 4 digits', () => {
    expect(pinSchema.safeParse('123').success).toBe(false);
    expect(pinSchema.safeParse('12345').success).toBe(false);
    expect(pinSchema.safeParse('abcd').success).toBe(false);
    expect(pinSchema.safeParse('0420').success).toBe(true);
  });
  it('kid avatar must come from AVATARS', () => {
    const base = { displayName: 'Bé', gradeId: uuid, familyId: uuid, pin: '1234' };
    expect(kidInput.safeParse({ ...base, avatar: '💀' }).success).toBe(false);
    expect(kidInput.safeParse({ ...base, avatar: '🐶' }).success).toBe(true);
  });
  it('kid pin is optional (editing keeps old PIN)', () => {
    const r = kidInput.safeParse({
      displayName: 'Bé',
      avatar: '🐶',
      gradeId: uuid,
      familyId: uuid,
      pin: '',
    });
    expect(r.success && r.data.pin).toBe(undefined);
  });
  it('parent password needs 8+ chars', () => {
    const base = { email: 'a@b.vn', displayName: 'Mẹ', familyId: uuid };
    expect(parentInput.safeParse({ ...base, password: 'short' }).success).toBe(false);
    expect(parentInput.safeParse({ ...base, password: 'longenough' }).success).toBe(true);
  });
});
