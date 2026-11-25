import { describe, expect, it } from 'vitest';
import {
  formatVisitDateTime,
  todayInVietnam,
  toVietnamDatetimeLocal,
  vietnamInputToIso,
} from './today';

describe('todayInVietnam', () => {
  it('rolls over at 17:00 UTC (00:00 in Vietnam)', () => {
    expect(todayInVietnam(new Date('2026-11-24T23:30:00Z'))).toBe('2026-11-25');
    expect(todayInVietnam(new Date('2026-11-24T16:59:00Z'))).toBe('2026-11-24');
    expect(todayInVietnam(new Date('2026-11-24T17:00:00Z'))).toBe('2026-11-25');
  });
});

describe('Vietnam datetime helpers', () => {
  it('converts UTC Date to Vietnam datetime-local string', () => {
    expect(toVietnamDatetimeLocal(new Date('2026-11-25T12:30:00Z'))).toBe('2026-11-25T19:30');
  });

  it('interprets naive date and datetime-local inputs as +07:00', () => {
    expect(vietnamInputToIso('2026-11-25T19:30')).toBe('2026-11-25T12:30:00.000Z');
    expect(vietnamInputToIso('2026-11-25')).toBe('2026-11-25T05:00:00.000Z');
    expect(vietnamInputToIso('not-a-date')).toBeNull();
  });

  it('formats ISO timestamps into DD/MM/YYYY HH:mm in Vietnam', () => {
    expect(formatVisitDateTime('2026-11-25T12:30:00.000Z')).toBe('25/11/2026 19:30');
  });
});
