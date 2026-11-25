import { describe, expect, it } from 'vitest';
import {
  matchesPickerFilter,
  putFileWithProgress,
  queueReducer,
  shouldShowUploadedInPicker,
  toggleSelectedMap,
  tryAcquireUploadLock,
  type UploadQueueItem,
} from './uploadClient';
import type { MediaFileItem } from './types';

function makeQueueItem(overrides?: Partial<UploadQueueItem>): UploadQueueItem {
  return {
    localId: 'q-1',
    file: new File(['hello'], 'doc.pdf', { type: 'application/pdf' }),
    name: 'doc.pdf',
    sizeBytes: 5,
    mimeType: 'application/pdf',
    previewUrl: null,
    folderId: null,
    visibility: 'private',
    status: 'idle',
    progress: 0,
    error: null,
    ...overrides,
  };
}

describe('queueReducer', () => {
  it('transitions idle -> uploading -> error -> remove cleanly', () => {
    const item = makeQueueItem();
    let state = queueReducer([], { type: 'enqueue', items: [item] });
    expect(state).toHaveLength(1);

    state = queueReducer(state, { type: 'progress', localId: 'q-1', progress: 45 });
    expect(state[0].status).toBe('uploading');
    expect(state[0].progress).toBe(45);

    state = queueReducer(state, { type: 'error', localId: 'q-1', error: 'Lỗi mạng' });
    expect(state[0].status).toBe('error');
    expect(state[0].error).toBe('Lỗi mạng');
    expect(state[0].file.name).toBe('doc.pdf');

    state = queueReducer(state, { type: 'remove', localId: 'q-1' });
    expect(state).toEqual([]);
  });
});

describe('putFileWithProgress', () => {
  it('sets Content-Type, reports progress, and resolves on 2xx', async () => {
    const headers: Record<string, string> = {};
    const progresses: number[] = [];

    await putFileWithProgress(
      'https://storage.test/upload',
      new File(['abc'], 'a.png', { type: 'image/png' }),
      (pct) => progresses.push(pct),
      () => ({
        upload: {},
        status: 200,
        open() {},
        setRequestHeader(k, v) {
          headers[k] = v;
        },
        send() {
          this.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 2 });
          this.onload?.();
        },
      }),
    );

    expect(headers['Content-Type']).toBe('image/png');
    expect(progresses).toEqual([50, 100]);
  });

  it('rejects with Vietnamese error on non-2xx or network error', async () => {
    await expect(
      putFileWithProgress(
        'https://storage.test/upload',
        new File(['abc'], 'a.png', { type: 'image/png' }),
        () => {},
        () => ({
          upload: {},
          status: 403,
          open() {},
          setRequestHeader() {},
          send() {
            this.onload?.();
          },
        }),
      ),
    ).rejects.toThrow('Tải tệp lên máy chủ lưu trữ thất bại');

    await expect(
      putFileWithProgress(
        'https://storage.test/upload',
        new File(['abc'], 'a.png', { type: 'image/png' }),
        () => {},
        () => ({
          upload: {},
          status: 0,
          open() {},
          setRequestHeader() {},
          send() {
            this.onerror?.();
          },
        }),
      ),
    ).rejects.toThrow('Mất kết nối khi tải tệp lên');
  });
});

describe('matchesPickerFilter', () => {
  const imgFile: MediaFileItem = {
    id: '1',
    folderId: null,
    visibility: 'public',
    driver: 'supabase',
    storageKey: '2026/11/a.webp',
    name: 'a.webp',
    alt: null,
    mimeType: 'image/webp',
    sizeBytes: 100,
    width: 100,
    height: 100,
    createdAt: '',
    url: 'https://x/a.webp',
  };

  it('filters by kind and visibility', () => {
    expect(matchesPickerFilter(imgFile, { accept: 'image', visibility: 'public' })).toBe(true);
    expect(matchesPickerFilter(imgFile, { accept: 'document', visibility: 'public' })).toBe(false);
    expect(matchesPickerFilter(imgFile, { accept: 'all', visibility: 'private' })).toBe(false);
    expect(matchesPickerFilter(imgFile, { accept: 'all', visibility: 'all' })).toBe(true);
  });
});

describe('toggleSelectedMap & shouldShowUploadedInPicker', () => {
  const pubImg: MediaFileItem = {
    id: 'f1',
    folderId: 'folder-a',
    visibility: 'public',
    driver: 'supabase',
    storageKey: '2026/11/a.webp',
    name: 'a.webp',
    alt: null,
    mimeType: 'image/webp',
    sizeBytes: 100,
    width: 100,
    height: 100,
    createdAt: '',
    url: 'https://x/a.webp',
  };
  const pubDoc: MediaFileItem = {
    ...pubImg,
    id: 'f2',
    folderId: 'folder-b',
    name: 'doc.pdf',
    mimeType: 'application/pdf',
  };

  it('retains selections across folder switches when multiple=true', () => {
    let map = new Map<string, MediaFileItem>();
    map = toggleSelectedMap(map, pubImg, true);
    map = toggleSelectedMap(map, pubDoc, true);
    expect([...map.keys()]).toEqual(['f1', 'f2']);
    map = toggleSelectedMap(map, pubImg, true);
    expect([...map.keys()]).toEqual(['f2']);

    const single = toggleSelectedMap(map, pubImg, false);
    expect([...single.keys()]).toEqual(['f1']);
  });

  it('checks picker filter, active folder, and search before prepending uploaded file', () => {
    expect(
      shouldShowUploadedInPicker(pubImg, {
        accept: 'image',
        visibility: 'public',
        activeVisibility: 'public',
        folderId: 'folder-a',
        search: '',
      }),
    ).toBe(true);

    expect(
      shouldShowUploadedInPicker(pubImg, {
        accept: 'document',
        visibility: 'public',
        activeVisibility: 'public',
        folderId: 'folder-a',
        search: '',
      }),
    ).toBe(false);

    expect(
      shouldShowUploadedInPicker(pubImg, {
        accept: 'all',
        visibility: 'all',
        activeVisibility: 'public',
        folderId: 'folder-b',
        search: '',
      }),
    ).toBe(false);
  });
});

describe('tryAcquireUploadLock', () => {
  it('blocks duplicate concurrent retry calls for the same localId', () => {
    const locks = new Set<string>();
    expect(tryAcquireUploadLock(locks, 'q-1')).toBe(true);
    expect(tryAcquireUploadLock(locks, 'q-1')).toBe(false);
    locks.delete('q-1');
    expect(tryAcquireUploadLock(locks, 'q-1')).toBe(true);
  });
});
