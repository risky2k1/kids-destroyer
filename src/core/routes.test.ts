import { describe, expect, it } from 'vitest';
import { PATHS } from './routes';

describe('PATHS', () => {
  it('builds family detail url', () => {
    expect(PATHS.admin.family('abc')).toBe('/admin/families/abc');
  });
  it('exposes kid root', () => {
    expect(PATHS.kid.root).toBe('/kid');
  });
});
