'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionState } from '@/core/actions';
import { requireAnyPermission, requirePermission } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';
import { resolveInheritedVisibility, validateFolderMove } from './lib/actionValidation';
import { mediaDbError } from './lib/errors';
import { buildMediaStorageKey } from './lib/files';
import {
  confirmUploadSchema,
  folderCreateSchema,
  folderRenameSchema,
  requestUploadSchema,
  updateMediaFileSchema,
} from './lib/schemas';
import { activeStorageDriverId, getStorageDriver, isValidStorageDriverId } from './lib/storage';
import type { MediaFileItem, MediaFolder, MediaKind, MediaVisibility } from './lib/types';
import {
  createPrivateDownloadUrl,
  listMediaFiles,
  listMediaFolders,
  mapMediaFile,
  mapMediaFolder,
} from './queries';

const uuidSchema = z.uuid('Mã không hợp lệ');

export async function createFolderAction(input: {
  parentId: string | null;
  name: string;
  visibility: MediaVisibility;
}): Promise<ActionState & { folder?: MediaFolder }> {
  const user = await requirePermission('media.manage');
  const parsed = folderCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  let visibility = parsed.data.visibility;

  if (parsed.data.parentId) {
    const { data: parent, error: pErr } = await sb
      .from('media_folders')
      .select('visibility')
      .eq('id', parsed.data.parentId)
      .maybeSingle();
    if (pErr || !parent) return { ok: false, error: 'Thư mục cha không tồn tại' };
    const checked = resolveInheritedVisibility(
      { visibility: parent.visibility as MediaVisibility },
      parsed.data.visibility,
    );
    if (!checked.ok) return { ok: false, error: checked.error };
    visibility = checked.visibility;
  }

  const { data, error } = await sb
    .from('media_folders')
    .insert({
      parent_id: parsed.data.parentId,
      name: parsed.data.name,
      visibility,
      created_by: user.id,
    })
    .select('id, parent_id, name, visibility, created_at')
    .single();

  if (error || !data) return { ok: false, error: mediaDbError(error ?? {}) };
  revalidatePath(PATHS.admin.media);
  return { ok: true, folder: mapMediaFolder(data) };
}

export async function renameFolderAction(id: string, name: string): Promise<ActionState> {
  await requirePermission('media.manage');
  const parsed = folderRenameSchema.safeParse({ id, name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { error } = await sb
    .from('media_folders')
    .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) return { ok: false, error: mediaDbError(error) };
  revalidatePath(PATHS.admin.media);
  return { ok: true };
}

export async function deleteFolderAction(id: string): Promise<ActionState> {
  await requirePermission('media.manage');
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Mã thư mục không hợp lệ' };

  const sb = await createClient();
  const [{ count: childCount }, { count: fileCount }] = await Promise.all([
    sb.from('media_folders').select('id', { count: 'exact', head: true }).eq('parent_id', id),
    sb.from('media_files').select('id', { count: 'exact', head: true }).eq('folder_id', id),
  ]);

  if ((childCount ?? 0) > 0 || (fileCount ?? 0) > 0) {
    return {
      ok: false,
      error: 'Thư mục đang có tệp hoặc thư mục con, hãy di chuyển hoặc xoá trước',
    };
  }

  const { error } = await sb.from('media_folders').delete().eq('id', id);
  if (error) return { ok: false, error: mediaDbError(error) };
  revalidatePath(PATHS.admin.media);
  return { ok: true };
}

export async function requestMediaUploadAction(input: {
  folderId: string | null;
  visibility: MediaVisibility;
  name: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<
  ActionState & {
    upload?: {
      uploadUrl: string;
      method: 'PUT';
      token?: string;
      driver: string;
      storageKey: string;
      visibility: MediaVisibility;
      folderId: string | null;
    };
  }
> {
  await requirePermission('media.manage');
  const parsed = requestUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  let visibility = parsed.data.visibility;

  if (parsed.data.folderId) {
    const { data: folder, error: fErr } = await sb
      .from('media_folders')
      .select('visibility')
      .eq('id', parsed.data.folderId)
      .maybeSingle();
    if (fErr || !folder) return { ok: false, error: 'Thư mục không tồn tại' };
    const checked = resolveInheritedVisibility(
      { visibility: folder.visibility as MediaVisibility },
      parsed.data.visibility,
    );
    if (!checked.ok) return { ok: false, error: checked.error };
    visibility = checked.visibility;
  }

  const driverId = activeStorageDriverId();
  const storageKey = buildMediaStorageKey(parsed.data.mimeType);

  try {
    const target = await getStorageDriver(driverId, sb).createUploadTarget({
      visibility,
      storageKey,
      mimeType: parsed.data.mimeType,
    });
    return {
      ok: true,
      upload: {
        uploadUrl: target.uploadUrl,
        method: target.method,
        token: target.token,
        driver: driverId,
        storageKey,
        visibility,
        folderId: parsed.data.folderId,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Không tạo được liên kết tải lên',
    };
  }
}

export async function confirmMediaUploadAction(input: {
  folderId: string | null;
  visibility: MediaVisibility;
  driver: string;
  storageKey: string;
  name: string;
  alt?: string | null;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
}): Promise<ActionState & { file?: MediaFileItem }> {
  const user = await requirePermission('media.manage');
  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isValidStorageDriverId(parsed.data.driver)) {
    return { ok: false, error: 'Nhà cung cấp lưu trữ không được hỗ trợ' };
  }

  const sb = await createClient();
  let visibility = parsed.data.visibility;

  if (parsed.data.folderId) {
    const { data: folder, error: fErr } = await sb
      .from('media_folders')
      .select('visibility')
      .eq('id', parsed.data.folderId)
      .maybeSingle();
    if (fErr || !folder) return { ok: false, error: 'Thư mục không tồn tại' };
    const checked = resolveInheritedVisibility(
      { visibility: folder.visibility as MediaVisibility },
      parsed.data.visibility,
    );
    if (!checked.ok) return { ok: false, error: checked.error };
    visibility = checked.visibility;
  }

  const { data, error } = await sb
    .from('media_files')
    .insert({
      folder_id: parsed.data.folderId,
      visibility,
      driver: parsed.data.driver,
      storage_key: parsed.data.storageKey,
      name: parsed.data.name,
      alt: parsed.data.alt,
      mime_type: parsed.data.mimeType,
      size_bytes: parsed.data.sizeBytes,
      width: parsed.data.width,
      height: parsed.data.height,
      created_by: user.id,
    })
    .select(
      'id, folder_id, visibility, driver, storage_key, name, alt, mime_type, size_bytes, width, height, created_at',
    )
    .single();

  if (error || !data) return { ok: false, error: mediaDbError(error ?? {}) };
  revalidatePath(PATHS.admin.media);
  return { ok: true, file: mapMediaFile(data, sb) };
}

export async function updateMediaFileAction(
  id: string,
  input: { name: string; alt: string | null; folderId: string | null },
): Promise<ActionState> {
  await requirePermission('media.manage');
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Mã tệp không hợp lệ' };
  const parsed = updateMediaFileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = await createClient();
  const { data: existing, error: exErr } = await sb
    .from('media_files')
    .select('visibility')
    .eq('id', id)
    .maybeSingle();
  if (exErr || !existing) return { ok: false, error: 'Không tìm thấy tệp' };

  if (parsed.data.folderId) {
    const { data: targetFolder, error: tfErr } = await sb
      .from('media_folders')
      .select('visibility')
      .eq('id', parsed.data.folderId)
      .maybeSingle();
    if (tfErr || !targetFolder) return { ok: false, error: 'Thư mục đích không tồn tại' };
    const checked = validateFolderMove(existing.visibility as MediaVisibility, {
      visibility: targetFolder.visibility as MediaVisibility,
    });
    if (!checked.ok) return { ok: false, error: checked.error };
  }

  const { error } = await sb
    .from('media_files')
    .update({
      name: parsed.data.name,
      alt: parsed.data.alt,
      folder_id: parsed.data.folderId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { ok: false, error: mediaDbError(error) };
  revalidatePath(PATHS.admin.media);
  return { ok: true };
}

export async function deleteMediaFileAction(id: string): Promise<ActionState> {
  await requirePermission('media.manage');
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Mã tệp không hợp lệ' };

  const sb = await createClient();
  const { data, error } = await sb
    .from('media_files')
    .delete()
    .eq('id', id)
    .select('driver, visibility, storage_key')
    .single();

  if (error || !data) return { ok: false, error: mediaDbError(error ?? {}) };

  try {
    await getStorageDriver(data.driver, sb).remove(data.visibility as MediaVisibility, [
      data.storage_key,
    ]);
  } catch {
    // DB record is already removed; ignore storage cleanup failure.
  }

  revalidatePath(PATHS.admin.media);
  return { ok: true };
}

export async function createPrivateReadUrlAction(
  id: string,
): Promise<ActionState & { url?: string }> {
  await requireAnyPermission(['media.view', 'media.manage']);
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Mã tệp không hợp lệ' };

  try {
    const url = await createPrivateDownloadUrl(id, 600);
    if (!url) return { ok: false, error: 'Không tìm thấy tệp' };
    return { ok: true, url };
  } catch {
    return { ok: false, error: 'Không tạo được liên kết tạm thời' };
  }
}

export async function searchMediaPickerAction(input: {
  folderId: string | null;
  visibility?: MediaVisibility;
  kind?: MediaKind;
  search?: string;
}): Promise<{ folders: MediaFolder[]; files: MediaFileItem[] }> {
  await requireAnyPermission(['media.view', 'media.manage']);
  const [folders, files] = await Promise.all([
    listMediaFolders({ visibility: input.visibility }),
    listMediaFiles({
      folderId: input.search?.trim() ? undefined : input.folderId,
      visibility: input.visibility,
      kind: input.kind,
      search: input.search,
      limit: 60,
    }),
  ]);
  return { folders, files };
}
