import { describe, expect, it } from 'vitest';
import { canAddPhoto, checkPhotoFile, fitWithin, photoFileName, photoPath } from './photos';

describe('checkPhotoFile', () => {
  it('accepts a 2 MB jpeg', () => {
    expect(checkPhotoFile({ size: 2_097_152, type: 'image/jpeg' })).toBeNull();
  });

  it('rejects files over 2 MB', () => {
    expect(checkPhotoFile({ size: 2_097_153, type: 'image/png' })).toBe('Ảnh tối đa 2 MB');
  });

  it('rejects other image types', () => {
    expect(checkPhotoFile({ size: 10, type: 'image/gif' })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP');
    expect(checkPhotoFile({ size: 10, type: 'image/svg+xml' })).toBe(
      'Chỉ nhận ảnh JPG, PNG hoặc WEBP',
    );
  });
});

describe('canAddPhoto', () => {
  it('allows up to 5 photos', () => {
    expect(canAddPhoto(4)).toBe(true);
    expect(canAddPhoto(5)).toBe(false);
  });
});

describe('photoPath', () => {
  it('nests the file under the place id with the right extension', () => {
    expect(photoPath('p1', 'image/png', 'abc')).toBe('p1/abc.png');
    expect(photoPath('p1', 'image/jpeg', 'abc')).toBe('p1/abc.jpg');
  });

  it('generates a random id when none is given', () => {
    expect(photoPath('p1', 'image/webp')).toMatch(/^p1\/[0-9a-f-]{36}\.webp$/);
  });
});

describe('fitWithin', () => {
  it('scales the long side down to the limit, keeping the aspect ratio', () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('leaves small images alone', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('photoFileName', () => {
  it('extracts the trailing filename from a storage path', () => {
    expect(photoFileName('place-1/abc-123.webp')).toBe('abc-123.webp');
    expect(photoFileName('plain.jpg')).toBe('plain.jpg');
    expect(photoFileName('')).toBe('Ảnh');
    expect(photoFileName('place-1/')).toBe('Ảnh');
  });
});
