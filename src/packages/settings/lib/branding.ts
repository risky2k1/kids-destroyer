export const BRANDING_MAX_BYTES = 1024 * 1024;

export const BRANDING_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

export function checkBrandingFile(file: { size: number; type: string }): string | null {
  if (!BRANDING_TYPES[file.type]) {
    return 'Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO';
  }
  if (file.size > BRANDING_MAX_BYTES) {
    return 'Ảnh tối đa 1 MB';
  }
  return null;
}
