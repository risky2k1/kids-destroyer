import { describe, expect, it } from 'vitest';
import { BRANDING_MAX_BYTES, BRANDING_TYPES, checkBrandingFile } from './branding';

describe('branding', () => {
  it('maps expected mime types to extensions', () => {
    expect(BRANDING_TYPES['image/png']).toBe('png');
    expect(BRANDING_TYPES['image/jpeg']).toBe('jpg');
    expect(BRANDING_TYPES['image/webp']).toBe('webp');
    expect(BRANDING_TYPES['image/x-icon']).toBe('ico');
    expect(BRANDING_TYPES['image/vnd.microsoft.icon']).toBe('ico');
  });

  it('accepts valid files within 1 MB', () => {
    expect(checkBrandingFile({ size: 100, type: 'image/png' })).toBeNull();
    expect(checkBrandingFile({ size: BRANDING_MAX_BYTES, type: 'image/jpeg' })).toBeNull();
    expect(checkBrandingFile({ size: 5000, type: 'image/webp' })).toBeNull();
    expect(checkBrandingFile({ size: 1024, type: 'image/x-icon' })).toBeNull();
    expect(checkBrandingFile({ size: 1024, type: 'image/vnd.microsoft.icon' })).toBeNull();
  });

  it('rejects unsupported mime types', () => {
    expect(checkBrandingFile({ size: 100, type: 'image/gif' })).toBe(
      'Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO',
    );
    expect(checkBrandingFile({ size: 100, type: 'text/plain' })).toBe(
      'Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO',
    );
    expect(checkBrandingFile({ size: 100, type: '' })).toBe('Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO');
  });

  it('rejects files larger than 1 MB', () => {
    expect(checkBrandingFile({ size: BRANDING_MAX_BYTES + 1, type: 'image/png' })).toBe(
      'Ảnh tối đa 1 MB',
    );
  });
});
