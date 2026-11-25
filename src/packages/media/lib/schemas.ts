import { z } from 'zod';
import { MEDIA_MAX_BYTES, MEDIA_MIME_EXT } from './files';

export const visibilitySchema = z.enum(['public', 'private']);

const folderNameSchema = z
  .string()
  .trim()
  .min(1, 'Nhập tên thư mục')
  .max(80, 'Tên thư mục tối đa 80 ký tự');

const fileNameSchema = z
  .string()
  .trim()
  .min(1, 'Nhập tên tệp')
  .max(160, 'Tên tệp tối đa 160 ký tự');

const mimeTypeSchema = z
  .string()
  .refine((m) => Boolean(MEDIA_MIME_EXT[m]), 'Định dạng tệp không được hỗ trợ');

const sizeBytesSchema = z
  .number()
  .int()
  .positive('Tệp rỗng không hợp lệ')
  .max(MEDIA_MAX_BYTES, 'Tệp tối đa 10 MB');

const optionalId = z.uuid('Mã không hợp lệ').nullable();

const optionalAlt = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z.string().trim().max(300, 'Mô tả ảnh tối đa 300 ký tự').nullable(),
);

export const folderCreateSchema = z.object({
  parentId: optionalId,
  name: folderNameSchema,
  visibility: visibilitySchema,
});

export const folderRenameSchema = z.object({
  id: z.uuid('Mã thư mục không hợp lệ'),
  name: folderNameSchema,
});

export const requestUploadSchema = z.object({
  folderId: optionalId,
  visibility: visibilitySchema,
  name: fileNameSchema,
  mimeType: mimeTypeSchema,
  sizeBytes: sizeBytesSchema,
});

export const confirmUploadSchema = z.object({
  folderId: optionalId,
  visibility: visibilitySchema,
  driver: z.string().trim().min(1).max(32),
  storageKey: z.string().trim().min(1).max(300),
  name: fileNameSchema,
  alt: optionalAlt.optional().default(null),
  mimeType: mimeTypeSchema,
  sizeBytes: sizeBytesSchema,
  width: z.number().int().positive().nullable().optional().default(null),
  height: z.number().int().positive().nullable().optional().default(null),
});

export const updateMediaFileSchema = z.object({
  name: fileNameSchema,
  alt: optionalAlt,
  folderId: optionalId,
});
