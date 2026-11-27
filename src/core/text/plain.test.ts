import { describe, expect, it } from 'vitest';
import { asPlain, plainText } from './plain';

describe('plainText', () => {
  it('folds styled Latin and digits to plain ASCII', () => {
    expect(plainText('\u{1D40B}')).toBe('L');
    expect(plainText('\u{1D434}')).toBe('A');
    expect(plainText('\u{1D49C}')).toBe('A');
    expect(plainText('\u{1D504}')).toBe('A');
    expect(plainText('\u{210E}')).toBe('h');
    expect(plainText('\u{FF2C}')).toBe('L');
    expect(plainText('\u{1D7CF}')).toBe('1');
  });

  it('keeps Vietnamese marks and case', () => {
    expect(plainText('\u{1D40B}ẩu')).toBe('Lẩu');
    expect(plainText('Phở')).toBe('Phở');
    expect(plainText('HELLO')).toBe('HELLO');
  });

  it('leaves emoji and non-strings alone', () => {
    expect(plainText('🍜 Lẩu')).toBe('🍜 Lẩu');
    expect(asPlain(3)).toBe(3);
    expect(asPlain(null)).toBe(null);
  });
});
