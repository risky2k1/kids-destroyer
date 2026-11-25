import { describe, expect, it } from 'vitest';
import { mediaDbError } from './errors';

describe('mediaDbError', () => {
  it('maps unique violations and restrict deletes to Vietnamese messages', () => {
    expect(mediaDbError({ code: '23505' })).toBe('Tên đã tồn tại trong thư mục này');
    expect(mediaDbError({ code: '23503' })).toBe(
      'Thư mục đang có tệp hoặc thư mục con, hãy di chuyển hoặc xoá trước',
    );
    expect(mediaDbError({ code: '42501' })).toBe('Không thực hiện được thao tác');
    expect(mediaDbError({})).toBe('Không thực hiện được thao tác');
  });
});
