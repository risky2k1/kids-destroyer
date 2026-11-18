import { describe, expect, it } from 'vitest';
import { PATHS } from './routes';

describe('PATHS', () => {
  it('builds family detail url', () => {
    expect(PATHS.admin.family('abc')).toBe('/admin/families/abc');
  });
  it('exposes kid root', () => {
    expect(PATHS.kid.root).toBe('/kid');
  });
  it('splits catalog into its own screens', () => {
    expect(PATHS.admin.subjects).toBe('/admin/catalog/subjects');
    expect(PATHS.admin.grades).toBe('/admin/catalog/grades');
    expect(PATHS.admin.topics).toBe('/admin/catalog/topics');
  });
});
