import { describe, expect, it } from 'vitest';
import {
  MEDIA_MAX_BYTES,
  buildMediaStorageKey,
  checkMediaFile,
  formatFileSize,
  isImageMime,
  mediaKindFromMime,
} from './files';

describe('checkMediaFile', () => {
  it('accepts valid images and documents up to 10 MB', () => {
    expect(checkMediaFile({ size: MEDIA_MAX_BYTES, type: 'image/webp' })).toBeNull();
    expect(checkMediaFile({ size: 1024, type: 'application/pdf' })).toBeNull();
    expect(
      checkMediaFile({
        size: 5000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    ).toBeNull();
  });

  it('rejects empty or oversized files', () => {
    expect(checkMediaFile({ size: 0, type: 'image/png' })).toBe('Tệp rỗng không hợp lệ');
    expect(checkMediaFile({ size: MEDIA_MAX_BYTES + 1, type: 'application/pdf' })).toBe(
      'Tệp tối đa 10 MB',
    );
  });

  it('rejects svg and unsupported mime types', () => {
    expect(checkMediaFile({ size: 100, type: 'image/svg+xml' })).toBe(
      'Định dạng tệp không được hỗ trợ',
    );
    expect(checkMediaFile({ size: 100, type: 'application/javascript' })).toBe(
      'Định dạng tệp không được hỗ trợ',
    );
    expect(checkMediaFile({ size: 100, type: '' })).toBe('Định dạng tệp không được hỗ trợ');
  });
});

describe('media mime & key helpers', () => {
  it('detects image vs document mime types', () => {
    expect(isImageMime('image/png')).toBe(true);
    expect(isImageMime('application/pdf')).toBe(false);
    expect(mediaKindFromMime('image/gif')).toBe('image');
    expect(mediaKindFromMime('text/markdown')).toBe('document');
  });

  it('builds YYYY/MM/uuid.ext storage keys', () => {
    expect(buildMediaStorageKey('image/png', new Date('2026-11-25T00:00:00Z'), 'uuid-1')).toBe(
      '2026/11/uuid-1.png',
    );
    expect(buildMediaStorageKey('application/pdf', new Date('2026-03-01T00:00:00Z'), 'id-2')).toBe(
      '2026/03/id-2.pdf',
    );
  });

  it('formats byte sizes cleanly', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
