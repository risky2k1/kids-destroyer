'use client';

import { PHOTO_MAX_SIDE, fitWithin } from '@/plugins/places/shared';

/**
 * Downscale a phone photo to ≤ PHOTO_MAX_SIDE px and re-encode as JPEG so it fits the 2 MB limit
 * (and the server action body limit). Returns the original file if the browser cannot decode it.
 */
export async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height, PHOTO_MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
