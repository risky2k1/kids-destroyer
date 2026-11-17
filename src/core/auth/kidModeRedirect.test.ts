import { describe, expect, it } from 'vitest';
import { kidModeRedirect } from './kidModeRedirect';

describe('kidModeRedirect', () => {
  it('sends kid mode away from parent and admin areas', () => {
    expect(kidModeRedirect('/parent', true)).toBe('/kid');
    expect(kidModeRedirect('/admin/catalog', true)).toBe('/kid');
  });
  it('leaves kid area alone', () => {
    expect(kidModeRedirect('/kid', true)).toBeNull();
  });
  it('does nothing without kid cookie', () => {
    expect(kidModeRedirect('/parent', false)).toBeNull();
  });
  it('matches whole path segments only', () => {
    expect(kidModeRedirect('/parentx', true)).toBeNull();
  });
});
