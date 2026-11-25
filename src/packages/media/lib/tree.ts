import type { MediaFolder, MediaVisibility } from './types';

export function folderBreadcrumb(
  folders: readonly MediaFolder[],
  folderId: string | null,
): MediaFolder[] {
  if (!folderId) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: MediaFolder[] = [];
  const seen = new Set<string>();
  let currentId: string | null = folderId;

  while (currentId && !seen.has(currentId)) {
    const folder = byId.get(currentId);
    if (!folder) return [];
    seen.add(currentId);
    chain.unshift(folder);
    currentId = folder.parentId;
  }
  return chain;
}

export function canPlaceInFolder(
  targetFolder: Pick<MediaFolder, 'visibility'> | null,
  itemVisibility: MediaVisibility,
): boolean {
  if (!targetFolder) return true;
  return targetFolder.visibility === itemVisibility;
}

export function canMoveFolder(
  folders: readonly MediaFolder[],
  folderId: string,
  targetParentId: string | null,
): boolean {
  if (targetParentId === folderId) return false;
  const byId = new Map(folders.map((f) => [f.id, f]));
  const source = byId.get(folderId);
  if (!source) return false;
  if (!targetParentId) return true;
  const target = byId.get(targetParentId);
  if (!target || target.visibility !== source.visibility) return false;

  const seen = new Set<string>();
  let cursor: string | null = targetParentId;
  while (cursor && !seen.has(cursor)) {
    if (cursor === folderId) return false;
    seen.add(cursor);
    cursor = byId.get(cursor)?.parentId ?? null;
  }
  return true;
}
