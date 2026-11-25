import { describe, expect, it } from 'vitest';
import {
  formatClockInVietnam,
  formatOpeningHours,
  isOpenAt,
  nowMinutesInVietnam,
  parseTimeMinutes,
  resolveFilterMinute,
} from './hours';

describe('parseTimeMinutes', () => {
  it('parses valid HH:MM and 24:00', () => {
    expect(parseTimeMinutes('00:00')).toBe(0);
    expect(parseTimeMinutes('06:30')).toBe(390);
    expect(parseTimeMinutes('23:59')).toBe(1439);
    expect(parseTimeMinutes('24:00')).toBe(1440);
  });

  it('rejects malformed or out-of-range times', () => {
    expect(parseTimeMinutes('25:00')).toBeNull();
    expect(parseTimeMinutes('12:60')).toBeNull();
    expect(parseTimeMinutes('6:30')).toBeNull();
    expect(parseTimeMinutes('abc')).toBeNull();
  });
});

describe('isOpenAt', () => {
  it('treats empty slots as always matching (unknown hours)', () => {
    expect(isOpenAt([], 3 * 60)).toBe(true);
    expect(isOpenAt([], 23 * 60)).toBe(true);
  });

  it('matches normal daytime slots', () => {
    const slots = [{ open: '06:00', close: '21:00' }];
    expect(isOpenAt(slots, 6 * 60)).toBe(true);
    expect(isOpenAt(slots, 12 * 60)).toBe(true);
    expect(isOpenAt(slots, 20 * 60 + 59)).toBe(true);
    expect(isOpenAt(slots, 21 * 60)).toBe(false);
    expect(isOpenAt(slots, 23 * 60)).toBe(false);
    expect(isOpenAt(slots, 5 * 60 + 59)).toBe(false);
  });

  it('matches split shifts (morning + evening)', () => {
    const slots = [
      { open: '06:30', close: '13:30' },
      { open: '17:00', close: '22:00' },
    ];
    expect(isOpenAt(slots, 8 * 60)).toBe(true);
    expect(isOpenAt(slots, 15 * 60)).toBe(false);
    expect(isOpenAt(slots, 19 * 60)).toBe(true);
  });

  it('matches overnight slots (e.g. 18:00 to 02:00)', () => {
    const slots = [{ open: '18:00', close: '02:00' }];
    expect(isOpenAt(slots, 17 * 60 + 59)).toBe(false);
    expect(isOpenAt(slots, 18 * 60)).toBe(true);
    expect(isOpenAt(slots, 23 * 60 + 30)).toBe(true);
    expect(isOpenAt(slots, 0)).toBe(true);
    expect(isOpenAt(slots, 1 * 60 + 59)).toBe(true);
    expect(isOpenAt(slots, 2 * 60)).toBe(false);
  });

  it('matches 24/24 slots (00:00–00:00 or 00:00–24:00)', () => {
    expect(isOpenAt([{ open: '00:00', close: '00:00' }], 3 * 60)).toBe(true);
    expect(isOpenAt([{ open: '00:00', close: '24:00' }], 23 * 60)).toBe(true);
  });
});

describe('Vietnam clock helpers', () => {
  it('formats and converts UTC dates to +07:00 minutes', () => {
    // 16:30 UTC == 23:30 +07:00
    const night = new Date('2026-11-25T16:30:00Z');
    expect(formatClockInVietnam(night)).toBe('23:30');
    expect(nowMinutesInVietnam(night)).toBe(23 * 60 + 30);
  });

  it('resolves timeSlot filters', () => {
    expect(resolveFilterMinute('any', 600)).toBeNull();
    expect(resolveFilterMinute('now', 600)).toBe(600);
    expect(resolveFilterMinute('night', 600)).toBe(23 * 60);
  });
});

describe('formatOpeningHours', () => {
  it('formats empty, 24/24, single, and multiple slots', () => {
    expect(formatOpeningHours([])).toBe('');
    expect(formatOpeningHours([{ open: '00:00', close: '00:00' }])).toBe('Mở 24/24');
    expect(formatOpeningHours([{ open: '06:00', close: '21:00' }])).toBe('06:00–21:00');
    expect(
      formatOpeningHours([
        { open: '06:30', close: '13:30' },
        { open: '17:00', close: '22:00' },
      ]),
    ).toBe('06:30–13:30, 17:00–22:00');
  });
});
