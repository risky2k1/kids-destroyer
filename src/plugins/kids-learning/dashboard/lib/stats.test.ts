import { describe, expect, it } from 'vitest';
import { kidsByGrade, timeAgo } from './stats';

describe('kidsByGrade', () => {
  it('keeps every grade, including zeros, ordered by sort', () => {
    const g = [
      { id: 'b', name: 'Lớp 1', sort: 1 },
      { id: 'a', name: 'Mẫu giáo', sort: 0 },
    ];
    expect(kidsByGrade(g, [{ grade_id: 'b' }, { grade_id: 'b' }])).toEqual([
      { name: 'Mẫu giáo', count: 0 },
      { name: 'Lớp 1', count: 2 },
    ]);
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-11-18T12:00:00Z');

  it('formats Vietnamese relative time', () => {
    expect(timeAgo('2026-11-18T11:59:30Z', now)).toBe('vừa xong');
    expect(timeAgo('2026-11-18T11:00:00Z', now)).toBe('1 giờ trước');
    expect(timeAgo('2026-11-16T12:00:00Z', now)).toBe('2 ngày trước');
    expect(timeAgo('2026-11-04T12:00:00Z', now)).toBe('2 tuần trước');
    expect(timeAgo('2026-08-18T12:00:00Z', now)).toBe('3 tháng trước');
  });
});
