import { describe, expect, it } from 'vitest';
import { grade } from './grade';

describe('number grade', () => {
  it('scores an exact value as 1', () => {
    expect(grade({}, { value: 3.5, tolerance: 0 }, { value: 3.5 }).score).toBe(1);
  });

  it('accepts a value inside the tolerance', () => {
    expect(grade({}, { value: 10, tolerance: 0.5 }, { value: 10.4 }).score).toBe(1);
  });

  it('rejects a value outside the tolerance', () => {
    expect(grade({}, { value: 10, tolerance: 0 }, { value: 11 }).score).toBe(0);
  });
});
