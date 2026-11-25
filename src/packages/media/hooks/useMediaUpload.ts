'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { confirmMediaUploadAction, requestMediaUploadAction } from '../actions';
import { checkMediaFile, isImageMime } from '../lib/files';
import type { MediaFileItem, MediaVisibility } from '../lib/types';
import {
  putFileWithProgress,
  queueReducer,
  readImageDimensions,
  type UploadQueueItem,
} from '../lib/uploadClient';

export function useMediaUpload({
  onUploaded,
}: {
  onUploaded?: (file: MediaFileItem) => void;
} = {}) {
  const [queue, dispatch] = useReducer(queueReducer, []);
  const queueRef = useRef<UploadQueueItem[]>([]);
  const onUploadedRef = useRef(onUploaded);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  useEffect(() => {
    return () => {
      for (const item of queueRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const runUpload = useCallback(async (item: UploadQueueItem) => {
    const fileError = checkMediaFile(item.file);
    if (fileError) {
      dispatch({ type: 'error', localId: item.localId, error: fileError });
      return;
    }

    dispatch({ type: 'progress', localId: item.localId, progress: 5 });

    try {
      const [dims, req] = await Promise.all([
        readImageDimensions(item.file),
        requestMediaUploadAction({
          folderId: item.folderId,
          visibility: item.visibility,
          name: item.name,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
        }),
      ]);

      if (!req.ok || !req.upload) {
        dispatch({
          type: 'error',
          localId: item.localId,
          error: req.error ?? 'Không khởi tạo được tải lên',
        });
        return;
      }

      await putFileWithProgress(req.upload.uploadUrl, item.file, (pct) => {
        dispatch({ type: 'progress', localId: item.localId, progress: pct });
      });

      const saved = await confirmMediaUploadAction({
        folderId: req.upload.folderId,
        visibility: req.upload.visibility,
        driver: req.upload.driver,
        storageKey: req.upload.storageKey,
        name: item.name,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
      });

      if (!saved.ok || !saved.file) {
        dispatch({
          type: 'error',
          localId: item.localId,
          error: saved.error ?? 'Không lưu được thông tin tệp',
        });
        return;
      }

      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      dispatch({ type: 'remove', localId: item.localId });
      onUploadedRef.current?.(saved.file);
    } catch (err) {
      dispatch({
        type: 'error',
        localId: item.localId,
        error: err instanceof Error ? err.message : 'Tải tệp thất bại',
      });
    }
  }, []);

  const enqueueFiles = useCallback(
    (
      files: FileList | File[],
      target: { folderId: string | null; visibility: MediaVisibility },
    ) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const items: UploadQueueItem[] = list.map((file) => {
        const previewUrl =
          isImageMime(file.type) && typeof URL !== 'undefined' ? URL.createObjectURL(file) : null;
        return {
          localId: crypto.randomUUID(),
          file,
          name: file.name || 'tep-tai-len',
          sizeBytes: file.size,
          mimeType: file.type,
          previewUrl,
          folderId: target.folderId,
          visibility: target.visibility,
          status: 'idle',
          progress: 0,
          error: null,
        };
      });

      dispatch({ type: 'enqueue', items });
      for (const item of items) {
        void runUpload(item);
      }
    },
    [runUpload],
  );

  const retryItem = useCallback(
    (localId: string) => {
      const item = queueRef.current.find((q) => q.localId === localId);
      if (!item) return;
      void runUpload(item);
    },
    [runUpload],
  );

  const dismissItem = useCallback((localId: string) => {
    const item = queueRef.current.find((q) => q.localId === localId);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    dispatch({ type: 'remove', localId });
  }, []);

  return { queue, enqueueFiles, retryItem, dismissItem };
}
