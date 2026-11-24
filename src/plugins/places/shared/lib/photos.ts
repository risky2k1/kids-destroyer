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
