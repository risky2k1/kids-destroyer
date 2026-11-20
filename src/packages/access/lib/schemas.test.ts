import { describe, expect, it } from 'vitest';
import { permissionKeys, roleInput, roleNameInput } from './schemas';

describe('roleInput', () => {
  it('accepts valid role id and name', () => {
    const valid = roleInput.safeParse({ id: 'teacher_1', name: 'Giáo viên' });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid role id', () => {
    expect(roleInput.safeParse({ id: '1teacher', name: 'Giáo viên' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'Teacher', name: 'Giáo viên' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'a', name: 'Giáo viên' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'a'.repeat(32), name: 'Giáo viên' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'teacher-role', name: 'Giáo viên' }).success).toBe(false);
  });

  it('rejects invalid role name', () => {
    expect(roleInput.safeParse({ id: 'teacher', name: '' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'teacher', name: '   ' }).success).toBe(false);
    expect(roleInput.safeParse({ id: 'teacher', name: 'x'.repeat(51) }).success).toBe(false);
  });
});

describe('roleNameInput', () => {
  it('validates role name only', () => {
    expect(roleNameInput.safeParse({ name: 'Quản trị viên' }).success).toBe(true);
    expect(roleNameInput.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('permissionKeys', () => {
  it('accepts valid permission key format', () => {
    expect(permissionKeys.safeParse(['access.manage', 'catalog.subjects-edit']).success).toBe(true);
  });

  it('rejects invalid keys', () => {
    expect(permissionKeys.safeParse(['invalidkey']).success).toBe(false);
    expect(permissionKeys.safeParse(['.key']).success).toBe(false);
    expect(permissionKeys.safeParse(['group.']).success).toBe(false);
    expect(permissionKeys.safeParse(['Group.Name']).success).toBe(false);
  });

  it('enforces maximum 200 items', () => {
    const excessive = Array.from({ length: 201 }, (_, i) => `mod.perm-${i}`);
    expect(permissionKeys.safeParse(excessive).success).toBe(false);
  });
});
