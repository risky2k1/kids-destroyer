'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Check, FileText, Folder, Search, Upload } from 'lucide-react';
import { cn } from '@/themes/neobrutal/lib/utils';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/themes/neobrutal/ui/dialog';
import { Input } from '@/themes/neobrutal/ui/input';
import { searchMediaPickerAction } from '../actions';
import { useMediaUpload } from '../hooks/useMediaUpload';
import {
  MEDIA_ACCEPT_ATTR,
  MEDIA_IMAGE_ACCEPT_ATTR,
  formatFileSize,
  isImageMime,
} from '../lib/files';
import { folderBreadcrumb } from '../lib/tree';
import type { MediaFileItem, MediaFolder, MediaKind, MediaVisibility } from '../lib/types';
import { matchesPickerFilter } from '../lib/uploadClient';
import { MediaUploadQueue } from './MediaUploadQueue';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accept?: MediaKind | 'all';
  visibility?: MediaVisibility | 'all';
  multiple?: boolean;
  canManage?: boolean;
  onSelect: (files: MediaFileItem[]) => void;
};

export function MediaPicker({
  open,
  onOpenChange,
  accept = 'all',
  visibility = 'public',
  multiple = false,
  canManage = false,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<MediaVisibility>(visibility === 'private' ? 'private' : 'public');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, startLoading] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVisibility = visibility === 'all' ? tab : visibility;

  const load = useCallback(() => {
    startLoading(async () => {
      const res = await searchMediaPickerAction({
        folderId,
        visibility: activeVisibility,
        kind: accept === 'all' ? undefined : accept,
        search: search || undefined,
      });
      setFolders(res.folders);
      setFiles(res.files);
    });
  }, [accept, activeVisibility, folderId, search]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const { queue, enqueueFiles, retryItem, dismissItem } = useMediaUpload({
    onUploaded: (file) => {
      setFiles((prev) => [file, ...prev]);
      if (matchesPickerFilter(file, { accept, visibility })) {
        setSelectedIds((prev) => (multiple ? [...prev, file.id] : [file.id]));
      }
    },
  });

  const childFolders = useMemo(
    () => (search.trim() ? [] : folders.filter((f) => f.parentId === folderId)),
    [folders, folderId, search],
  );
  const crumbs = useMemo(() => folderBreadcrumb(folders, folderId), [folders, folderId]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedFiles = useMemo(
    () => files.filter((f) => selectedSet.has(f.id)),
    [files, selectedSet],
  );

  function toggleFile(id: string) {
    if (multiple) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    } else {
      setSelectedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  }

  function handleConfirm() {
    if (selectedFiles.length === 0) return;
    onSelect(selectedFiles);
    setSelectedIds([]);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-3 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn tệp từ thư viện</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          {visibility === 'all' && (
            <div className="flex gap-1">
              {(['public', 'private'] as const).map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="xs"
                  variant={tab === v ? 'default' : 'neutral'}
                  onClick={() => {
                    setTab(v);
                    setFolderId(null);
                  }}
                >
                  {v === 'public' ? 'Công khai' : 'Riêng tư'}
                </Button>
              ))}
            </div>
          )}

          <div className="relative min-w-44 flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-foreground/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên tệp…"
              className="h-9 pl-8"
            />
          </div>

          {canManage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept === 'image' ? MEDIA_IMAGE_ACCEPT_ATTR : MEDIA_ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    enqueueFiles(e.target.files, { folderId, visibility: activeVisibility });
                  }
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="neutral"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Tải tệp lên
              </Button>
            </>
          )}
        </div>

        <MediaUploadQueue items={queue} onRetry={retryItem} onDismiss={dismissItem} />

        {!search.trim() && (
          <nav className="flex flex-wrap items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFolderId(null)}
              className="font-heading underline hover:text-main"
            >
              Thư mục gốc
            </button>
            {crumbs.map((c) => (
              <span key={c.id} className="flex items-center gap-1">
                <span>/</span>
                <button
                  type="button"
                  onClick={() => setFolderId(c.id)}
                  className="font-heading underline hover:text-main"
                >
                  {c.name}
                </button>
              </span>
            ))}
          </nav>
        )}

        <div className="min-h-56 flex-1 overflow-y-auto rounded-base border-2 border-border bg-secondary-background p-3">
          {loading ? (
            <p className="py-12 text-center text-sm text-foreground/60">Đang tải thư viện…</p>
          ) : childFolders.length === 0 && files.length === 0 ? (
            <p className="py-12 text-center text-sm text-foreground/60">Chưa có tệp nào phù hợp.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {childFolders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setFolderId(folder.id)}
                  className="flex items-center gap-2 rounded-base border-2 border-border bg-background p-2.5 text-left text-sm hover:bg-main/15"
                >
                  <Folder className="size-5 shrink-0" />
                  <span className="truncate font-heading">{folder.name}</span>
                </button>
              ))}

              {files.map((file) => {
                const selected = selectedSet.has(file.id);
                const isImg = isImageMime(file.mimeType);
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => toggleFile(file.id)}
                    className={cn(
                      'relative flex flex-col gap-1.5 rounded-base border-2 p-2 text-left transition-colors',
                      selected
                        ? 'border-border bg-main/20 shadow-shadow'
                        : 'border-border bg-background hover:bg-foreground/5',
                    )}
                  >
                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-base border border-border/30 bg-foreground/10">
                      {isImg && file.url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                        <img src={file.url} alt="" className="size-full object-cover" />
                      ) : (
                        <FileText className="size-7 text-foreground/50" />
                      )}
                    </div>
                    <p className="truncate text-xs font-heading">{file.name}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-foreground/60">
                        {formatFileSize(file.sizeBytes)}
                      </span>
                      {file.visibility === 'private' && <Badge variant="neutral">Riêng tư</Badge>}
                    </div>
                    {selected && (
                      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="button" disabled={selectedFiles.length === 0} onClick={handleConfirm}>
            Chọn ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
