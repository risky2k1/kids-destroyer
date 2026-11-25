import 'server-only';
import type { Database } from '@/core/supabase/database.types';
import { createClient } from '@/core/supabase/server';
import { isImageMime } from './lib/files';
import { getStorageDriver, type SupabaseStorageClient } from './lib/storage';
import type { MediaFileItem, MediaFolder, MediaKind, MediaVisibility } from './lib/types';

type FolderRow = Database['public']['Tables']['media_folders']['Row'];
type FileRow = Database['public']['Tables']['media_files']['Row'];

const FOLDER_COLS = 'id, parent_id, name, visibility, created_at';
const FILE_COLS =
  'id, folder_id, visibility, driver, storage_key, name, alt, mime_type, size_bytes, width, height, created_at';

export function mapMediaFolder(
  row: Pick<FolderRow, 'id' | 'parent_id' | 'name' | 'visibility' | 'created_at'>,
): MediaFolder {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    visibility: row.visibility as MediaVisibility,
    createdAt: row.created_at,
  };
}

export function mapMediaFile(
  row: Pick<
    FileRow,
    | 'id'
    | 'folder_id'
    | 'visibility'
    | 'driver'
    | 'storage_key'
    | 'name'
    | 'alt'
    | 'mime_type'
    | 'size_bytes'
    | 'width'
    | 'height'
    | 'created_at'
  >,
  sb: SupabaseStorageClient,
): MediaFileItem {
  const visibility = row.visibility as MediaVisibility;
  const url =
    visibility === 'public' ? getStorageDriver(row.driver, sb).getPublicUrl(row.storage_key) : null;

  return {
    id: row.id,
    folderId: row.folder_id,
    visibility,
    driver: row.driver,
    storageKey: row.storage_key,
    name: row.name,
    alt: row.alt,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    url,
  };
}

export async function listMediaFolders(filters?: {
  visibility?: MediaVisibility;
}): Promise<MediaFolder[]> {
  const sb = await createClient();
  let query = sb.from('media_folders').select(FOLDER_COLS).order('name');
  if (filters?.visibility) {
    query = query.eq('visibility', filters.visibility);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapMediaFolder);
}

export async function listMediaFiles(filters?: {
  folderId?: string | null;
  visibility?: MediaVisibility;
  kind?: MediaKind;
  search?: string;
  limit?: number;
}): Promise<MediaFileItem[]> {
  const sb = await createClient();
  let query = sb
    .from('media_files')
    .select(FILE_COLS)
    .order('created_at', { ascending: false })
    .limit(filters?.limit ?? 100);

  if (filters?.folderId !== undefined) {
    query =
      filters.folderId === null
        ? query.is('folder_id', null)
        : query.eq('folder_id', filters.folderId);
  }
  if (filters?.visibility) {
    query = query.eq('visibility', filters.visibility);
  }
  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const mapped = data.map((row) => mapMediaFile(row, sb));
  if (filters?.kind === 'image') return mapped.filter((f) => isImageMime(f.mimeType));
  if (filters?.kind === 'document') return mapped.filter((f) => !isImageMime(f.mimeType));
  return mapped;
}

export async function getMediaFilesByIds(ids: readonly string[]): Promise<MediaFileItem[]> {
  if (ids.length === 0) return [];
  const sb = await createClient();
  const { data, error } = await sb
    .from('media_files')
    .select(FILE_COLS)
    .in('id', [...ids]);
  if (error || !data) return [];
  return data.map((row) => mapMediaFile(row, sb));
}

export async function resolveMediaUrl(
  file: Pick<MediaFileItem, 'driver' | 'visibility' | 'storageKey'>,
  expiresInSeconds = 600,
): Promise<string | null> {
  const sb = await createClient();
  const driver = getStorageDriver(file.driver, sb);
  if (file.visibility === 'public') return driver.getPublicUrl(file.storageKey);
  try {
    return await driver.createSignedReadUrl(file.storageKey, expiresInSeconds);
  } catch {
    return null;
  }
}

export async function createPrivateDownloadUrl(
  id: string,
  expiresInSeconds = 600,
): Promise<string | null> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('media_files')
    .select('driver, visibility, storage_key')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  const driver = getStorageDriver(data.driver, sb);
  if (data.visibility === 'public') return driver.getPublicUrl(data.storage_key);
  return driver.createSignedReadUrl(data.storage_key, expiresInSeconds);
}
