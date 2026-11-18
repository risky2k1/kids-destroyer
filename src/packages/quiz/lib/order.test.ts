import { describe, expect, it } from 'vitest';
import { move } from './order';

describe('move', () => {
  it('does nothing at the edge', () => {
    expect(move(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
  });

  it('swaps with the neighbour', () => {
    expect(move(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });
});
