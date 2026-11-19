import { describe, expect, it } from 'vitest';
import { scramble } from './scramble';

describe('order/lib/scramble', () => {
  it('returns a valid permutation', () => {
    const input = ['Bước 1', 'Bước 2', 'Bước 3', 'Bước 4'];
    const result = scramble(input);

    expect(result.items).toHaveLength(input.length);
    expect(result.order).toHaveLength(input.length);

    // Items must contain all original elements
    expect([...result.items].sort()).toEqual([...input].sort());

    // Order must contain all indices 0..n-1 without duplicates
    const sortedOrder = [...result.order].sort((a, b) => a - b);
    expect(sortedOrder).toEqual([0, 1, 2, 3]);
  });

  it('does not match original order when n >= 2', () => {
    const testCases = [
      ['A', 'B'],
      ['1', '2', '3'],
      ['Sáng', 'Trưa', 'Chiều', 'Tối'],
      ['Trứng', 'Sâu', 'Kén', 'Bướm'],
      ['a', 'b', 'c', 'd', 'e', 'f'],
    ];

    for (const testCase of testCases) {
      const result = scramble(testCase);
      const isIdentical = result.items.every((item, i) => item === testCase[i]);
      expect(isIdentical).toBe(false);
    }
  });

  it('is deterministic: same input produces same output', () => {
    const input = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu'];
    const run1 = scramble(input);
    const run2 = scramble(input);

    expect(run1.items).toEqual(run2.items);
    expect(run1.order).toEqual(run2.order);
  });

  it('reconstructs the correct order from content.items and answer.order', () => {
    const testCases = [
      ['Đầu', 'Mình', 'Đuôi'],
      ['Hạt giống', 'Nảy mầm', 'Cây con', 'Cây trưởng thành', 'Ra hoa', 'Kết quả'],
      ['Một', 'Hai'],
    ];

    for (const original of testCases) {
      const { items, order } = scramble(original);
      const reconstructed = order.map((index) => items[index]);
      expect(reconstructed).toEqual(original);
    }
  });

  it('handles edge case of single element or empty array', () => {
    expect(scramble(['Duy nhất'])).toEqual({
      items: ['Duy nhất'],
      order: [0],
    });
    expect(scramble([])).toEqual({
      items: [],
      order: [],
    });
  });
});
