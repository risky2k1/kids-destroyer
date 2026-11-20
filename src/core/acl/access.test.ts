import { describe, expect, it } from 'vitest';
import { ADMIN_ACCESS, can, canEnter, SUPER_ADMIN, type Principal } from './access';

describe('ACL access', () => {
  const superAdmin: Principal = {
    roleId: SUPER_ADMIN,
    permissions: [],
    familyId: null,
  };

  const adminRole: Principal = {
    roleId: 'admin',
    permissions: [ADMIN_ACCESS],
    familyId: null,
  };

  const parent: Principal = {
    roleId: 'parent',
    permissions: [],
    familyId: 'f1',
  };

  const orphan: Principal = {
    roleId: 'parent',
    permissions: [],
    familyId: null,
  };

  it('super admin can do anything and enter admin area', () => {
    expect(can(superAdmin, 'any.permission')).toBe(true);
    expect(can(superAdmin, ADMIN_ACCESS)).toBe(true);
    expect(canEnter('admin', superAdmin)).toBe(true);
    expect(canEnter('parent', superAdmin)).toBe(true);
    expect(canEnter('kid', superAdmin)).toBe(false);
  });

  it('role with admin.access enters admin area', () => {
    expect(can(adminRole, ADMIN_ACCESS)).toBe(true);
    expect(canEnter('admin', adminRole)).toBe(true);
    expect(canEnter('parent', adminRole)).toBe(true);
  });

  it('parent (empty permissions, has family) cannot enter admin but enters kid', () => {
    expect(canEnter('admin', parent)).toBe(false);
    expect(canEnter('parent', parent)).toBe(true);
    expect(canEnter('kid', parent)).toBe(true);
  });

  it('user without family cannot enter kid mode', () => {
    expect(canEnter('kid', orphan)).toBe(false);
  });

  it('can returns false for missing permission', () => {
    expect(can(adminRole, 'other.permission')).toBe(false);
    expect(can(parent, 'any.permission')).toBe(false);
  });
});
