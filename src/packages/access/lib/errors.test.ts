import { describe, expect, it } from 'vitest';
import { accessErrorMessage } from './errors';

describe('accessErrorMessage', () => {
  it('maps unique violation (23505)', () => {
    expect(accessErrorMessage({ code: '23505' })).toBe('Mã hoặc tên vai trò đã tồn tại');
  });

  it('maps foreign key violation (23503)', () => {
    expect(accessErrorMessage({ code: '23503' })).toBe(
      'Vai trò đang có tài khoản dùng. Chuyển các tài khoản sang vai trò khác trước',
    );
  });

  it('maps permission denied (42501)', () => {
    expect(accessErrorMessage({ code: '42501' })).toBe('Bạn không có quyền thực hiện thao tác này');
  });

  it('maps custom check violation (P0001)', () => {
    expect(accessErrorMessage({ code: 'P0001' })).toBe('Phải còn ít nhất một quản trị tối cao');
  });

  it('maps check constraint violation (23514)', () => {
    expect(accessErrorMessage({ code: '23514' })).toBe('Vai trò Phụ huynh cần thuộc một gia đình');
  });

  it('falls back on null or unknown error', () => {
    expect(accessErrorMessage(null)).toBe('Không lưu được');
    expect(accessErrorMessage({ code: 'unknown' })).toBe('Không lưu được');
    expect(accessErrorMessage({})).toBe('Không lưu được');
  });
});
