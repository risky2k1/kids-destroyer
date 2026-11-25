import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  activeStorageDriverId,
  bucketForVisibility,
  createSupabaseStorageDriver,
  getStorageDriver,
  type SupabaseStorageClient,
} from './storage';

function makeFakeSupabase(
  overrides?: Partial<{
    signedUploadUrl: string;
    token: string;
    publicUrl: string;
    signedReadUrl: string;
  }>,
) {
  const calls: { method: string; bucket: string; args: unknown[] }[] = [];
  const client: SupabaseStorageClient = {
    storage: {
      from(bucket: string) {
        return {
          async createSignedUploadUrl(path: string) {
            calls.push({ method: 'createSignedUploadUrl', bucket, args: [path] });
            return {
              data: {
                signedUrl: overrides?.signedUploadUrl ?? `https://sb.test/upload/${bucket}/${path}`,
                token: overrides?.token ?? 'tok-1',
                path,
              },
              error: null,
            };
          },
          getPublicUrl(path: string) {
            calls.push({ method: 'getPublicUrl', bucket, args: [path] });
            return {
              data: {
                publicUrl: overrides?.publicUrl ?? `https://sb.test/public/${bucket}/${path}`,
              },
            };
          },
          async createSignedUrl(path: string, expiresIn: number) {
            calls.push({ method: 'createSignedUrl', bucket, args: [path, expiresIn] });
            return {
              data: {
                signedUrl:
                  overrides?.signedReadUrl ??
                  `https://sb.test/signed/${bucket}/${path}?exp=${expiresIn}`,
              },
              error: null,
            };
          },
          async remove(paths: string[]) {
            calls.push({ method: 'remove', bucket, args: [paths] });
            return { data: [], error: null };
          },
        };
      },
    },
  };
  return { client, calls };
}

afterEach(() => {
  delete process.env.MEDIA_STORAGE_DRIVER;
});

describe('media storage driver', () => {
  it('maps visibility to media-public and media-private buckets', () => {
    expect(bucketForVisibility('public')).toBe('media-public');
    expect(bucketForVisibility('private')).toBe('media-private');
  });

  it('defaults active driver to supabase and reads MEDIA_STORAGE_DRIVER', () => {
    expect(activeStorageDriverId()).toBe('supabase');
    process.env.MEDIA_STORAGE_DRIVER = 's3';
    expect(activeStorageDriverId()).toBe('s3');
  });

  it('throws on unsupported driver id', () => {
    const { client } = makeFakeSupabase();
    expect(() => getStorageDriver('unknown', client)).toThrow(
      'Nhà cung cấp lưu trữ không được hỗ trợ',
    );
  });

  it('implements upload target, public url, signed read url, and remove via supabase driver', async () => {
    const { client, calls } = makeFakeSupabase();
    const driver = createSupabaseStorageDriver(client);

    const target = await driver.createUploadTarget({
      visibility: 'public',
      storageKey: '2026/11/a.webp',
      mimeType: 'image/webp',
    });
    expect(target).toEqual({
      uploadUrl: 'https://sb.test/upload/media-public/2026/11/a.webp',
      method: 'PUT',
      token: 'tok-1',
    });

    expect(driver.getPublicUrl('2026/11/a.webp')).toBe(
      'https://sb.test/public/media-public/2026/11/a.webp',
    );

    const signed = await driver.createSignedReadUrl('2026/11/doc.pdf', 600);
    expect(signed).toBe('https://sb.test/signed/media-private/2026/11/doc.pdf?exp=600');

    await driver.remove('private', []);
    expect(calls.some((c) => c.method === 'remove')).toBe(false);

    await driver.remove('private', ['2026/11/doc.pdf']);
    expect(calls.at(-1)).toEqual({
      method: 'remove',
      bucket: 'media-private',
      args: [['2026/11/doc.pdf']],
    });
  });
});
