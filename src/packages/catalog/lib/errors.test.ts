import { describe, expect, it } from 'vitest';
import { catalogErrorMessage } from './errors';

describe('catalogErrorMessage', () => {
  it('maps FK violation', () => {
    expect(catalogErrorMessage({ code: '23503' })).toBe('Đang được dùng, không xóa được');
  });
  it('maps unique violation', () => {
    expect(catalogErrorMessage({ code: '23505' })).toBe('Tên đã tồn tại');
  });
  it('falls back', () => {
    expect(catalogErrorMessage({ code: '42501' })).toBe('Có lỗi, thử lại');
  });
});
