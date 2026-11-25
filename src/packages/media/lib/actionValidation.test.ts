import { describe, expect, it } from 'vitest';
import { resolveInheritedVisibility, validateFolderMove } from './actionValidation';

describe('resolveInheritedVisibility', () => {
  it('accepts requested visibility at root or when parent matches', () => {
    expect(resolveInheritedVisibility(null, 'private')).toEqual({
      ok: true,
      visibility: 'private',
    });
    expect(resolveInheritedVisibility({ visibility: 'public' }, 'public')).toEqual({
      ok: true,
      visibility: 'public',
    });
  });

  it('rejects mismatched visibility inside a parent folder', () => {
    expect(resolveInheritedVisibility({ visibility: 'private' }, 'public')).toEqual({
      ok: false,
      error: 'Thư mục cha có chế độ truy cập khác, không thể trộn công khai và riêng tư',
    });
  });
});

describe('validateFolderMove', () => {
  it('allows root or matching-visibility target folder and rejects mismatch', () => {
    expect(validateFolderMove('public', null)).toEqual({ ok: true });
    expect(validateFolderMove('private', { visibility: 'private' })).toEqual({ ok: true });
    expect(validateFolderMove('public', { visibility: 'private' })).toEqual({
      ok: false,
      error: 'Không thể chuyển tệp sang thư mục có chế độ truy cập khác',
    });
  });
});
