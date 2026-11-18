import { describe, expect, it } from 'vitest';
import { composeFill, parseFill } from './parseFill';

describe('parseFill', () => {
  it('splits alternatives and blanks the source', () => {
    expect(parseFill('Con mèo có [[4|bốn]] chân')).toEqual({
      text: 'Con mèo có [[]] chân',
      blanks: [['4', 'bốn']],
    });
  });

  it('requires at least one blank', () => {
    expect(parseFill('không có chỗ trống')).toEqual({
      error: 'Cần ít nhất một chỗ trống [[...]]',
    });
  });

  it('round-trips composed blanks', () => {
    const composed = composeFill('Con mèo có [[]] chân', [['4', 'bốn']]);
    expect(composed).toBe('Con mèo có [[4|bốn]] chân');
    expect(parseFill(composed)).toEqual({
      text: 'Con mèo có [[]] chân',
      blanks: [['4', 'bốn']],
    });
  });
});
