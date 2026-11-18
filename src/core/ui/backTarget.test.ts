import { describe, expect, it } from 'vitest';
import { PATHS } from '@/core/routes';
import { backTarget } from './backTarget';

describe('backTarget', () => {
  it('leaves admin screens without a back target', () => {
    expect(backTarget(PATHS.admin.root)).toBeNull();
    expect(backTarget(PATHS.admin.catalog)).toBeNull();
    expect(backTarget(PATHS.admin.subjects)).toBeNull();
    expect(backTarget(PATHS.admin.families)).toBeNull();
    expect(backTarget(PATHS.admin.family('abc'))).toBeNull();
  });

  it('sends an admin on the parent home back to admin, and a parent nowhere', () => {
    expect(backTarget(PATHS.parent.root, 'admin')).toEqual({
      href: PATHS.admin.root,
      label: 'Quản trị',
    });
    expect(backTarget(PATHS.parent.root, 'parent')).toBeNull();
    expect(backTarget(PATHS.parent.kidMode)).toEqual({
      href: PATHS.parent.root,
      label: 'Phụ huynh',
    });
  });

  it('leaves kid play and login without a back target', () => {
    expect(backTarget(PATHS.kid.root)).toBeNull();
    expect(backTarget(PATHS.kid.exit)).toEqual({ href: PATHS.kid.root, label: 'Làm bài' });
    expect(backTarget(PATHS.login)).toBeNull();
  });
});
