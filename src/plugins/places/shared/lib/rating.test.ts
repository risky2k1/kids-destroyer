import { describe, expect, it } from 'vitest';
import { formatRatingSummary, formatRatingValue } from './rating';

describe('formatRatingValue', () => {
  it('keeps whole numbers clean and rounds decimals to 1 digit', () => {
    expect(formatRatingValue(5)).toBe('5');
    expect(formatRatingValue(3.0)).toBe('3');
    expect(formatRatingValue(4.33)).toBe('4.3');
    expect(formatRatingValue(4.66)).toBe('4.7');
    expect(formatRatingValue(4.99)).toBe('5');
  });
});

describe('formatRatingSummary', () => {
  it('handles unrated and multi-visit counts', () => {
    expect(formatRatingSummary(null, 0)).toBe('Chưa chấm');
    expect(formatRatingSummary(null, 2)).toBe('Chưa chấm (2 lần)');
    expect(formatRatingSummary(4, 1)).toBe('4★');
    expect(formatRatingSummary(3, 2)).toBe('3★ (2 lần)');
    expect(formatRatingSummary(4.33, 3)).toBe('4.3★ (3 lần)');
  });
});
