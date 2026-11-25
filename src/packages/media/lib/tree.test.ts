import { describe, expect, it } from 'vitest';
import { canMoveFolder, canPlaceInFolder, folderBreadcrumb } from './tree';
import type { MediaFolder } from './types';

const folders: MediaFolder[] = [
  { id: 'r1', parentId: null, name: 'Blog', visibility: 'public', createdAt: '' },
  { id: 'c1', parentId: 'r1', name: '2026', visibility: 'public', createdAt: '' },
  { id: 'g1', parentId: 'c1', name: 'Tháng 11', visibility: 'public', createdAt: '' },
  { id: 'p1', parentId: null, name: 'Hồ sơ', visibility: 'private', createdAt: '' },
];

describe('folderBreadcrumb', () => {
  it('returns root to current folder in order', () => {
    expect(folderBreadcrumb(folders, 'g1').map((f) => f.id)).toEqual(['r1', 'c1', 'g1']);
    expect(folderBreadcrumb(folders, null)).toEqual([]);
  });

  it('stops safely on missing or cyclic parents', () => {
    const cyclic: MediaFolder[] = [
      { id: 'a', parentId: 'b', name: 'A', visibility: 'public', createdAt: '' },
      { id: 'b', parentId: 'a', name: 'B', visibility: 'public', createdAt: '' },
    ];
    expect(folderBreadcrumb(cyclic, 'a').map((f) => f.id)).toEqual(['b', 'a']);
    expect(folderBreadcrumb(folders, 'missing')).toEqual([]);
  });
});

describe('canMoveFolder & canPlaceInFolder', () => {
  it('blocks moving a folder into itself or a descendant or across visibility', () => {
    expect(canMoveFolder(folders, 'r1', 'r1')).toBe(false);
    expect(canMoveFolder(folders, 'r1', 'g1')).toBe(false);
    expect(canMoveFolder(folders, 'c1', 'p1')).toBe(false);
    expect(canMoveFolder(folders, 'g1', 'r1')).toBe(true);
    expect(canMoveFolder(folders, 'g1', null)).toBe(true);
  });

  it('enforces matching visibility when placing inside a folder', () => {
    expect(canPlaceInFolder(null, 'private')).toBe(true);
    expect(canPlaceInFolder(folders[0], 'public')).toBe(true);
    expect(canPlaceInFolder(folders[0], 'private')).toBe(false);
  });
});
