import { describe, expect, it } from 'vitest';
import { todayInVietnam } from './today';

describe('todayInVietnam', () => {
  it('rolls over at 17:00 UTC (00:00 in Vietnam)', () => {
    expect(todayInVietnam(new Date('2026-11-24T23:30:00Z'))).toBe('2026-11-25');
    expect(todayInVietnam(new Date('2026-11-24T16:59:00Z'))).toBe('2026-11-24');
    expect(todayInVietnam(new Date('2026-11-24T17:00:00Z'))).toBe('2026-11-25');
  });
});
