export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 5;

export const PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function checkPhotoFile(file: { size: number; type: string }): string | null {
  if (!PHOTO_TYPES[file.type]) return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP';
  if (file.size > PHOTO_MAX_BYTES) return 'Ảnh tối đa 2 MB';
  return null;
}

export const canAddPhoto = (current: number): boolean => current < PHOTO_MAX_COUNT;

export function photoPath(placeId: string, type: string, id: string = crypto.randomUUID()): string {
  return `${placeId}/${id}.${PHOTO_TYPES[type]}`;
}

/** Longest side (px) a photo is downscaled to in the browser before upload. */
export const PHOTO_MAX_SIDE = 1600;

/** Size that fits inside max×max, keeping the aspect ratio; never upscales. */
export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function photoFileName(path: string): string {
  const segment = path.split('/').pop()?.trim();
  return segment ? segment : 'Ảnh';
}
