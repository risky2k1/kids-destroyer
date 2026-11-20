import { describe, expect, it } from 'vitest';
import { SUPER_ADMIN, type Principal } from '@/core/acl/access';
import { canManage } from './canManage';

describe('canManage', () => {
  const superAdmin: Principal = {
    roleId: SUPER_ADMIN,
    permissions: [],
    familyId: null,
  };

  const manager: Principal = {
    roleId: 'manager',
    permissions: ['access.manage', 'catalog.manage', 'quiz.manage'],
    familyId: null,
  };

  it('super admin manages anyone', () => {
    expect(canManage(superAdmin, { roleId: SUPER_ADMIN, permissions: [] })).toBe(true);
    expect(canManage(superAdmin, { roleId: 'manager', permissions: ['access.manage'] })).toBe(true);
    expect(canManage(superAdmin, { roleId: 'editor', permissions: ['unknown.permission'] })).toBe(
      true,
    );
  });

  it('non-super never manages super admin', () => {
    expect(canManage(manager, { roleId: SUPER_ADMIN, permissions: [] })).toBe(false);
  });

  it('manages a role whose permissions are a subset', () => {
    expect(canManage(manager, { roleId: 'editor', permissions: ['catalog.manage'] })).toBe(true);
    expect(
      canManage(manager, { roleId: 'assistant', permissions: ['access.manage', 'quiz.manage'] }),
    ).toBe(true);
    expect(canManage(manager, { roleId: 'guest', permissions: [] })).toBe(true);
  });

  it('does not manage a role whose permissions are not a subset (target has permissions actor lacks)', () => {
    expect(canManage(manager, { roleId: 'finance', permissions: ['finance.manage'] })).toBe(false);
    expect(
      canManage(manager, { roleId: 'headmaster', permissions: ['catalog.manage', 'system.admin'] }),
    ).toBe(false);
  });
});
