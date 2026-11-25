import { isImageMime, mediaKindFromMime } from './files';
import type { MediaFileItem, MediaKind, MediaVisibility } from './types';

export type UploadStatus = 'idle' | 'uploading' | 'error';

export type UploadQueueItem = {
  localId: string;
  file: File;
  name: string;
  sizeBytes: number;
  mimeType: string;
  previewUrl: string | null;
  folderId: string | null;
  visibility: MediaVisibility;
  status: UploadStatus;
  progress: number;
  error: string | null;
};

export type QueueAction =
  | { type: 'enqueue'; items: UploadQueueItem[] }
  | { type: 'progress'; localId: string; progress: number }
  | { type: 'error'; localId: string; error: string }
  | { type: 'remove'; localId: string };

export function queueReducer(state: UploadQueueItem[], action: QueueAction): UploadQueueItem[] {
  switch (action.type) {
    case 'enqueue':
      return [...action.items, ...state];
    case 'progress':
      return state.map((item) =>
        item.localId === action.localId
          ? { ...item, status: 'uploading', progress: action.progress, error: null }
          : item,
      );
    case 'error':
      return state.map((item) =>
        item.localId === action.localId ? { ...item, status: 'error', error: action.error } : item,
      );
    case 'remove':
      return state.filter((item) => item.localId !== action.localId);
  }
}

export type XhrLike = {
  upload: {
    onprogress?:
      ((ev: { lengthComputable: boolean; loaded: number; total: number }) => void) | null;
  };
  status: number;
  onload?: (() => void) | null;
  onerror?: (() => void) | null;
  open(method: string, url: string): void;
  setRequestHeader(name: string, value: string): void;
  send(body: File): void;
};

export function putFileWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
  createXhr: () => XhrLike = () => new XMLHttpRequest() as unknown as XhrLike,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = createXhr();
    xhr.open('PUT', uploadUrl);
    if (file.type) {
      xhr.setRequestHeader('Content-Type', file.type);
    }
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        onProgress(Math.min(99, Math.round((ev.loaded / ev.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error('Tải tệp lên máy chủ lưu trữ thất bại'));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Mất kết nối khi tải tệp lên'));
    };
    xhr.send(file);
  });
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!isImageMime(file.type) || typeof Image === 'undefined' || typeof URL === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(
        img.naturalWidth > 0 && img.naturalHeight > 0
          ? { width: img.naturalWidth, height: img.naturalHeight }
          : null,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export function matchesPickerFilter(
  file: Pick<MediaFileItem, 'mimeType' | 'visibility'>,
  filter: { accept: MediaKind | 'all'; visibility: MediaVisibility | 'all' },
): boolean {
  if (filter.visibility !== 'all' && file.visibility !== filter.visibility) return false;
  if (filter.accept !== 'all' && mediaKindFromMime(file.mimeType) !== filter.accept) return false;
  return true;
}
