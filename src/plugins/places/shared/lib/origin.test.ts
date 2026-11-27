import { describe, expect, it } from 'vitest';
import { isApprovedPlace, originLabel } from './origin';

describe('originLabel', () => {
  it('names the three visible states', () => {
    expect(originLabel('community', 'pending')).toBe('Chờ duyệt');
    expect(originLabel('admin', 'pending')).toBe('Chờ duyệt');
    expect(originLabel('community', 'approved')).toBe('Community');
    expect(originLabel('admin', 'approved')).toBe('Rcmd');
  });

  it('lists only approved places', () => {
    expect(isApprovedPlace({ reviewStatus: 'approved' })).toBe(true);
    expect(isApprovedPlace({ reviewStatus: 'pending' })).toBe(false);
  });
});
