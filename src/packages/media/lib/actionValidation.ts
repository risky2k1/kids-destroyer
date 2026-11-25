import type { MediaFolder, MediaVisibility } from './types';

export function resolveInheritedVisibility(
  parentFolder: Pick<MediaFolder, 'visibility'> | null,
  requested: MediaVisibility,
): { ok: true; visibility: MediaVisibility } | { ok: false; error: string } {
  if (!parentFolder) return { ok: true, visibility: requested };
  if (parentFolder.visibility !== requested) {
    return {
      ok: false,
      error: 'Thư mục cha có chế độ truy cập khác, không thể trộn công khai và riêng tư',
    };
  }
  return { ok: true, visibility: parentFolder.visibility };
}

export function validateFolderMove(
  fileVisibility: MediaVisibility,
  targetFolder: Pick<MediaFolder, 'visibility'> | null,
): { ok: true } | { ok: false; error: string } {
  if (!targetFolder) return { ok: true };
  if (targetFolder.visibility !== fileVisibility) {
    return {
      ok: false,
      error: 'Không thể chuyển tệp sang thư mục có chế độ truy cập khác',
    };
  }
  return { ok: true };
}
