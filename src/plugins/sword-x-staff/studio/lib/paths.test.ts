import { describe, expect, it } from 'vitest';
import { tabFromPath } from './paths';

describe('tabFromPath', () => {
  it('reads the studio tab from the path', () => {
    expect(tabFromPath('/admin/sxs/c/abc/skills')).toBe('skills');
    expect(tabFromPath('/admin/sxs/c/abc/companions')).toBe('companions');
    expect(tabFromPath('/admin/sxs/c/abc/prompt')).toBe('prompt');
  });

  it('falls back to overview', () => {
    expect(tabFromPath('/admin/sxs/c/abc')).toBe('overview');
    expect(tabFromPath('/admin/sxs/c/abc/overview')).toBe('overview');
    expect(tabFromPath('/admin/sxs/c/abc/equipment')).toBe('overview');
    expect(tabFromPath('/admin/sxs/c/abc/resources')).toBe('overview');
  });
});
