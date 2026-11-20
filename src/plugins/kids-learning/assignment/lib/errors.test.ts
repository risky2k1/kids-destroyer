import { describe, expect, it } from 'vitest';
import { assignmentErrorMessage } from './errors';

describe('assignmentErrorMessage', () => {
  it('maps a duplicate attempt to an already-submitted message', () => {
    expect(assignmentErrorMessage({ code: '23505' })).toBe('Bài đã nộp');
  });
  it('maps a foreign-key violation when a played assignment cannot be deleted', () => {
    expect(assignmentErrorMessage({ code: '23503' })).toBe('Bài đã có lần làm, không xóa được');
  });
  it('falls back', () => {
    expect(assignmentErrorMessage({ code: '42501' })).toBe('Có lỗi, thử lại');
  });
});
