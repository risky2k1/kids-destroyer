import { describe, expect, it } from 'vitest';
import { scopeFilter } from './scope';

describe('scopeFilter', () => {
  it('keeps system questions and the caller’s own', () => {
    expect(scopeFilter('u1')).toBe('origin.eq.system,created_by.eq.u1');
  });
});
