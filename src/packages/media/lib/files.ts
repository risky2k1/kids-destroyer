import type { MediaKind } from './types';

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export const MEDIA_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
};

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const MEDIA_IMAGE_MIMES = Object.keys(MEDIA_MIME_EXT).filter((m) => IMAGE_MIMES.has(m));
export const MEDIA_DOCUMENT_MIMES = Object.keys(MEDIA_MIME_EXT).filter((m) => !IMAGE_MIMES.has(m));

export const MEDIA_ACCEPT_ATTR = Object.keys(MEDIA_MIME_EXT).join(',');
export const MEDIA_IMAGE_ACCEPT_ATTR = MEDIA_IMAGE_MIMES.join(',');
export const MEDIA_DOCUMENT_ACCEPT_ATTR = MEDIA_DOCUMENT_MIMES.join(',');

export function mimesForKind(kind?: MediaKind): readonly string[] | null {
  if (kind === 'image') return MEDIA_IMAGE_MIMES;
  if (kind === 'document') return MEDIA_DOCUMENT_MIMES;
  return null;
}

export function isImageMime(mime: string): boolean {
  return IMAGE_MIMES.has(mime);
}

export function mediaKindFromMime(mime: string): MediaKind {
  return isImageMime(mime) ? 'image' : 'document';
}

export function checkMediaFile(file: { size: number; type: string }): string | null {
  if (!MEDIA_MIME_EXT[file.type]) return 'Định dạng tệp không được hỗ trợ';
  if (file.size <= 0) return 'Tệp rỗng không hợp lệ';
  if (file.size > MEDIA_MAX_BYTES) return 'Tệp tối đa 10 MB';
  return null;
}

export function buildMediaStorageKey(
  mimeType: string,
  now: Date = new Date(),
  id: string = crypto.randomUUID(),
): string {
  const ext = MEDIA_MIME_EXT[mimeType];
  if (!ext) throw new Error('Định dạng tệp không được hỗ trợ');
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}/${month}/${id}.${ext}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = Math.round((bytes / 1024) * 10) / 10;
    return `${kb} KB`;
  }
  const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
  return `${mb} MB`;
}
