import { describe, expect, it } from 'vitest';
import { accountInput, passwordInput, permissionKeys, roleInput, roleNameInput } from './schemas';

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

describe('passwordInput', () => {
  it('accepts valid passwords between 8 and 72 characters', () => {
    expect(passwordInput.safeParse('12345678').success).toBe(true);
    expect(passwordInput.safeParse('a'.repeat(72)).success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const res = passwordInput.safeParse('1234567');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Mật khẩu tối thiểu 8 ký tự');
    }
  });

  it('rejects passwords longer than 72 characters', () => {
    expect(passwordInput.safeParse('a'.repeat(73)).success).toBe(false);
  });
});

describe('accountInput', () => {
  it('accepts valid account input and normalizes email', () => {
    const res = accountInput.safeParse({
      email: '  USER@example.COM  ',
      displayName: '  Nguyễn Văn A  ',
      password: 'password123',
      roleId: 'teacher',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.email).toBe('user@example.com');
      expect(res.data.displayName).toBe('Nguyễn Văn A');
      expect(res.data.password).toBe('password123');
      expect(res.data.roleId).toBe('teacher');
    }
  });

  it('rejects invalid email', () => {
    const res = accountInput.safeParse({
      email: 'not-an-email',
      displayName: 'Nguyễn Văn A',
      password: 'password123',
      roleId: 'teacher',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Email không hợp lệ');
    }
  });

  it('rejects empty or whitespace-only displayName', () => {
    const res = accountInput.safeParse({
      email: 'user@example.com',
      displayName: '   ',
      password: 'password123',
      roleId: 'teacher',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Nhập tên');
    }
  });

  it('rejects displayName longer than 50 characters', () => {
    const res = accountInput.safeParse({
      email: 'user@example.com',
      displayName: 'a'.repeat(51),
      password: 'password123',
      roleId: 'teacher',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Tên tối đa 50 ký tự');
    }
  });

  it('rejects invalid password', () => {
    const res = accountInput.safeParse({
      email: 'user@example.com',
      displayName: 'Nguyễn Văn A',
      password: 'short',
      roleId: 'teacher',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Mật khẩu tối thiểu 8 ký tự');
    }
  });

  it('rejects empty roleId', () => {
    const res = accountInput.safeParse({
      email: 'user@example.com',
      displayName: 'Nguyễn Văn A',
      password: 'password123',
      roleId: '',
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe('Chọn vai trò');
    }
  });
});
