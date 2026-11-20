import { describe, expect, it } from 'vitest';
import { permissionDiff } from './diff';

describe('permissionDiff', () => {
  it('computes added and removed permissions', () => {
    const current = ['a.read', 'b.write'];
    const next = ['b.write', 'c.manage'];
    expect(permissionDiff(current, next)).toEqual({
      add: ['c.manage'],
      remove: ['a.read'],
    });
  });

  it('deduplicates inputs', () => {
    const current = ['a.read', 'a.read', 'b.write'];
    const next = ['c.manage', 'c.manage'];
    expect(permissionDiff(current, next)).toEqual({
      add: ['c.manage'],
      remove: ['a.read', 'b.write'],
    });
  });

  it('is order-independent', () => {
    const current1 = ['a.read', 'b.write'];
    const current2 = ['b.write', 'a.read'];
    const next1 = ['c.manage', 'd.view'];
    const next2 = ['d.view', 'c.manage'];
    expect(permissionDiff(current1, next1)).toEqual(permissionDiff(current2, next2));
  });

  it('returns empty lists when identical', () => {
    expect(permissionDiff(['a.read'], ['a.read'])).toEqual({
      add: [],
      remove: [],
    });
  });
});
