import { describe, expect, it } from 'vitest';
import {
  confirmUploadSchema,
  folderCreateSchema,
  folderRenameSchema,
  requestUploadSchema,
  updateMediaFileSchema,
} from './schemas';

const UUID = '11111111-1111-4111-8111-111111111111';

describe('media schemas', () => {
  it('validates folder create and rename inputs', () => {
    expect(
      folderCreateSchema.safeParse({ name: 'Tài liệu', parentId: null, visibility: 'private' })
        .success,
    ).toBe(true);
    expect(
      folderCreateSchema.safeParse({ name: '  ', parentId: null, visibility: 'public' }).success,
    ).toBe(false);
    expect(folderRenameSchema.safeParse({ id: UUID, name: 'Ảnh Blog' }).success).toBe(true);
  });

  it('validates requestUploadSchema and rejects svg or >10MB', () => {
    expect(
      requestUploadSchema.safeParse({
        folderId: UUID,
        visibility: 'public',
        name: 'cover.webp',
        mimeType: 'image/webp',
        sizeBytes: 1024,
      }).success,
    ).toBe(true);

    expect(
      requestUploadSchema.safeParse({
        folderId: null,
        visibility: 'public',
        name: 'icon.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 1024,
      }).success,
    ).toBe(false);

    expect(
      requestUploadSchema.safeParse({
        folderId: null,
        visibility: 'private',
        name: 'big.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 10 * 1024 * 1024 + 1,
      }).success,
    ).toBe(false);
  });

  it('validates confirmUploadSchema and updateMediaFileSchema', () => {
    expect(
      confirmUploadSchema.safeParse({
        folderId: null,
        visibility: 'public',
        driver: 'supabase',
        storageKey: '2026/11/abc.png',
        name: 'abc.png',
        mimeType: 'image/png',
        sizeBytes: 200,
        width: 800,
        height: 600,
      }).success,
    ).toBe(true);

    expect(
      updateMediaFileSchema.safeParse({
        name: 'new-name.png',
        alt: 'a'.repeat(301),
        folderId: null,
      }).success,
    ).toBe(false);
  });
});
