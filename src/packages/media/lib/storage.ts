import 'server-only';
import type { MediaVisibility } from './types';

export type MediaUploadTarget = {
  uploadUrl: string;
  method: 'PUT';
  headers?: Record<string, string>;
  token?: string;
};

export interface MediaStorageDriver {
  readonly id: string;
  createUploadTarget(input: {
    visibility: MediaVisibility;
    storageKey: string;
    mimeType: string;
  }): Promise<MediaUploadTarget>;
  getPublicUrl(storageKey: string): string;
  createSignedReadUrl(storageKey: string, expiresInSeconds: number): Promise<string>;
  remove(visibility: MediaVisibility, storageKeys: string[]): Promise<void>;
}

type StorageBucketLike = {
  createSignedUploadUrl(
    path: string,
  ): Promise<{ data: { signedUrl: string; token: string; path: string } | null; error: unknown }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
  createSignedUrl(
    path: string,
    expiresIn: number,
  ): Promise<{ data: { signedUrl: string } | null; error: unknown }>;
  remove(paths: string[]): Promise<{ data: unknown; error: unknown }>;
};

export type SupabaseStorageClient = {
  storage: {
    from(bucket: string): StorageBucketLike;
  };
};

export function bucketForVisibility(visibility: MediaVisibility): 'media-public' | 'media-private' {
  return visibility === 'public' ? 'media-public' : 'media-private';
}

export function activeStorageDriverId(): string {
  return process.env.MEDIA_STORAGE_DRIVER?.trim() || 'supabase';
}

export function createSupabaseStorageDriver(sb: SupabaseStorageClient): MediaStorageDriver {
  return {
    id: 'supabase',
    async createUploadTarget({ visibility, storageKey }) {
      const bucket = bucketForVisibility(visibility);
      const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(storageKey);
      if (error || !data) {
        throw new Error('Không tạo được liên kết tải lên');
      }
      return {
        uploadUrl: data.signedUrl,
        method: 'PUT',
        token: data.token,
      };
    },
    getPublicUrl(storageKey) {
      return sb.storage.from('media-public').getPublicUrl(storageKey).data.publicUrl;
    },
    async createSignedReadUrl(storageKey, expiresInSeconds) {
      const { data, error } = await sb.storage
        .from('media-private')
        .createSignedUrl(storageKey, expiresInSeconds);
      if (error || !data) {
        throw new Error('Không tạo được liên kết tải xuống');
      }
      return data.signedUrl;
    },
    async remove(visibility, storageKeys) {
      if (storageKeys.length === 0) return;
      const bucket = bucketForVisibility(visibility);
      await sb.storage.from(bucket).remove(storageKeys);
    },
  };
}

const SUPPORTED_DRIVERS = new Set(['supabase']);

export function isValidStorageDriverId(driverId: string): boolean {
  return SUPPORTED_DRIVERS.has(driverId);
}

export function getStorageDriver(driverId: string, sb: SupabaseStorageClient): MediaStorageDriver {
  if (driverId === 'supabase') return createSupabaseStorageDriver(sb);
  throw new Error('Nhà cung cấp lưu trữ không được hỗ trợ');
}
