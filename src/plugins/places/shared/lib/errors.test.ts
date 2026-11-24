import { describe, expect, it } from 'vitest';
import { dbErrorMessage } from './errors';

describe('dbErrorMessage', () => {
  it.each([
    [{ code: '23505' }, 'Tên này đã có rồi'],
    [{ code: '23514' }, 'Dữ liệu không hợp lệ'],
    [{ code: '42501' }, 'Bạn không có quyền làm việc này'],
    [{ code: 'XX000' }, 'Không lưu được, thử lại nhé'],
    [{}, 'Không lưu được, thử lại nhé'],
    [null, 'Không lưu được, thử lại nhé'],
  ])('%j → %s', (error, message) => {
    expect(dbErrorMessage(error)).toBe(message);
  });
});
