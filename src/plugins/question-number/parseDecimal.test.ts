import { describe, expect, it } from 'vitest';
import { parseDecimal } from './parseDecimal';

describe('parseDecimal', () => {
  it('accepts a dot or a comma', () => {
    expect(parseDecimal('3.5')).toBe(3.5);
    expect(parseDecimal('3,5')).toBe(3.5);
  });

  it('rejects an incomplete decimal', () => {
    expect(parseDecimal('10,')).toBeNull();
    expect(parseDecimal('')).toBeNull();
  });
});
