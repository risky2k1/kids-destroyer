'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  Pencil,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { PATHS } from '@/core/routes';
import { RecordTable, type Column } from '@/core/ui/RecordTable';
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/themes/neobrutal/ui/attachment';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { toast } from '@/themes/neobrutal/ui/toast';
import { deleteFolderAction } from '../actions';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { MEDIA_ACCEPT_ATTR, formatFileSize, isImageMime } from '../lib/files';
import { folderBreadcrumb } from '../lib/tree';
import type { MediaFileItem, MediaFolder, MediaKind, MediaVisibility } from '../lib/types';
import { MediaFileDialog } from './MediaFileDialog';
import { MediaFolderDialog } from './MediaFolderDialog';
import { MediaUploadQueue } from './MediaUploadQueue';

type VisibilityTab = 'all' | MediaVisibility;
type KindTab = 'all' | MediaKind;

export function MediaBrowser({
  folders,
  files,
  currentFolderId,
  visibilityFilter,
  kindFilter,
  searchQuery,
  canManage,
}: {
  folders: MediaFolder[];
  files: MediaFileItem[];
  currentFolderId: string | null;
  visibilityFilter: VisibilityTab;
  kindFilter: KindTab;
  searchQuery: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [searchInput, setSearchInput] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setSearchInput(searchQuery);
  }
  const [folderDialog, setFolderDialog] = useState<
    | { kind: 'create'; parentId: string | null; fixedVisibility: MediaVisibility | null }
    | { kind: 'rename'; folder: MediaFolder }
    | null
  >(null);
  const [activeFile, setActiveFile] = useState<MediaFileItem | null>(null);
  const uploadVisRef = useRef<MediaVisibility>('public');
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId) ?? null,
    [folders, currentFolderId],
  );
  const crumbs = useMemo(
    () => folderBreadcrumb(folders, currentFolderId),
    [folders, currentFolderId],
  );

  const visibleFolders = useMemo(() => {
    if (searchQuery.trim()) return [];
    return folders.filter((f) => {
      if (f.parentId !== currentFolderId) return false;
      if (visibilityFilter !== 'all' && f.visibility !== visibilityFilter) return false;
      return true;
    });
  }, [folders, currentFolderId, visibilityFilter, searchQuery]);

  const { queue, enqueueFiles, retryItem, dismissItem } = useMediaUpload({
    onUploaded: () => router.refresh(),
  });

  function pushParams(next: {
    folder?: string | null;
    visibility?: VisibilityTab;
    kind?: KindTab;
    q?: string;
  }) {
    const params = new URLSearchParams();
    const f = next.folder !== undefined ? next.folder : currentFolderId;
    const v = next.visibility ?? visibilityFilter;
    const k = next.kind ?? kindFilter;
    const q = next.q !== undefined ? next.q : searchQuery;
    if (f) params.set('folder', f);
    if (v !== 'all') params.set('visibility', v);
    if (k !== 'all') params.set('kind', k);
    if (q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    router.push(qs ? `${PATHS.admin.media}?${qs}` : PATHS.admin.media);
  }

  function triggerUpload(visibility: MediaVisibility) {
    uploadVisRef.current = visibility;
    fileInputRef.current?.click();
  }

  function handleDeleteFolder(folder: MediaFolder) {
    startTransition(async () => {
      const res = await deleteFolderAction(folder.id);
      if (!res.ok) {
        toast.add({ title: res.error ?? 'Không xoá được thư mục', type: 'error' });
        return;
      }
      toast.add({ title: 'Đã xoá thư mục', type: 'success' });
      router.refresh();
    });
  }

  const fixedFolderVis: MediaVisibility | null =
    currentFolder?.visibility ?? (visibilityFilter === 'all' ? null : visibilityFilter);

  const columns: Column<MediaFileItem>[] = [
    {
      key: 'name',
      label: 'Tên tệp',
      icon: FileText,
      sortValue: (r) => r.name,
      render: (r) => (
        <button
          type="button"
          onClick={() => setActiveFile(r)}
          className="font-heading underline hover:text-main"
        >
          {r.name}
        </button>
      ),
    },
    {
      key: 'visibility',
      label: 'Truy cập',
      icon: Folder,
      render: (r) => (
        <Badge variant="neutral">{r.visibility === 'public' ? 'Công khai' : 'Riêng tư'}</Badge>
      ),
    },
    {
      key: 'size',
      label: 'Dung lượng',
      icon: FileText,
      sortValue: (r) => r.sizeBytes,
      render: (r) => formatFileSize(r.sizeBytes),
    },
    {
      key: 'mime',
      label: 'Định dạng',
      icon: FileText,
      render: (r) => r.mimeType,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(
            [
              ['all', 'Tất cả'],
              ['public', 'Công khai'],
              ['private', 'Riêng tư'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="xs"
              variant={visibilityFilter === id ? 'default' : 'neutral'}
              onClick={() => pushParams({ visibility: id, folder: null })}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex gap-1">
          {(
            [
              ['all', 'Mọi loại'],
              ['image', 'Ảnh'],
              ['document', 'Tài liệu'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="xs"
              variant={kindFilter === id ? 'default' : 'neutral'}
              onClick={() => pushParams({ kind: id })}
            >
              {label}
            </Button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushParams({ q: searchInput });
          }}
          className="relative flex min-w-52 flex-1 items-center gap-1"
        >
          <Search className="pointer-events-none absolute left-2.5 size-4 text-foreground/50" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên tệp…"
            className="h-9 pl-8"
          />
          <Button type="submit" size="sm" variant="neutral">
            Tìm
          </Button>
        </form>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === 'grid' ? 'default' : 'neutral'}
            aria-label="Xem dạng lưới"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === 'list' ? 'default' : 'neutral'}
            aria-label="Xem dạng danh sách"
            onClick={() => setViewMode('list')}
          >
            <List />
          </Button>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="neutral"
              onClick={() =>
                setFolderDialog({
                  kind: 'create',
                  parentId: currentFolderId,
                  fixedVisibility: fixedFolderVis,
                })
              }
            >
              <FolderPlus className="size-4" />
              Thư mục
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={MEDIA_ACCEPT_ATTR}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  enqueueFiles(e.target.files, {
                    folderId: currentFolderId,
                    visibility: fixedFolderVis ?? uploadVisRef.current,
                  });
                }
                e.target.value = '';
              }}
            />
            {fixedFolderVis ? (
              <Button type="button" size="sm" onClick={() => triggerUpload(fixedFolderVis)}>
                <Upload className="size-4" />
                Tải tệp lên
              </Button>
            ) : (
              <>
                <Button type="button" size="sm" onClick={() => triggerUpload('public')}>
                  <Upload className="size-4" />
                  Tải Công khai
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  onClick={() => triggerUpload('private')}
                >
                  <Upload className="size-4" />
                  Tải Riêng tư
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <nav className="flex flex-wrap items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={() => pushParams({ folder: null })}
          className="font-heading underline hover:text-main"
        >
          Thư viện gốc
        </button>
        {crumbs.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span className="text-foreground/40">/</span>
            <button
              type="button"
              onClick={() => pushParams({ folder: c.id })}
              className="font-heading underline hover:text-main"
            >
              {c.name}
            </button>
          </span>
        ))}
      </nav>

      <MediaUploadQueue items={queue} onRetry={retryItem} onDismiss={dismissItem} />

      {visibleFolders.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {visibleFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background p-2.5"
            >
              <button
                type="button"
                onClick={() => pushParams({ folder: folder.id })}
                className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-main"
              >
                <Folder className="size-5 shrink-0" />
                <span className="truncate text-sm font-heading">{folder.name}</span>
              </button>
              <Badge variant="neutral">
                {folder.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
              </Badge>
              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="neutral"
                    aria-label={`Đổi tên ${folder.name}`}
                    onClick={() => setFolderDialog({ kind: 'rename', folder })}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="neutral"
                    aria-label={`Xoá ${folder.name}`}
                    onClick={() => handleDeleteFolder(folder)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length === 0 ? (
        <div className="rounded-base border-2 border-dashed border-border/30 py-14 text-center text-sm text-foreground/60">
          Chưa có tệp nào trong mục này.
        </div>
      ) : viewMode === 'list' ? (
        <RecordTable
          columns={columns}
          rows={files}
          getId={(r) => r.id}
          addRow={
            canManage ? (
              <button
                type="button"
                onClick={() => triggerUpload(fixedFolderVis ?? 'public')}
                className="text-[13px] text-foreground/60 hover:text-foreground"
              >
                + Tải tệp lên
              </button>
            ) : (
              <span className="text-[13px] text-foreground/50">Chỉ xem</span>
            )
          }
        />
      ) : (
        <AttachmentGroup layout="grid">
          {files.map((file) => {
            const isImg = isImageMime(file.mimeType);
            return (
              <Attachment
                key={file.id}
                variant="card"
                render={<button type="button" />}
                className="w-44 cursor-pointer text-left hover:bg-main/10"
                onClick={() => setActiveFile(file)}
              >
                {isImg ? (
                  <AttachmentMedia variant="image">
                    {file.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                      <img src={file.url} alt={file.alt ?? ''} />
                    ) : null}
                  </AttachmentMedia>
                ) : (
                  <AttachmentMedia variant="icon" className="h-24 w-full">
                    <FileText aria-hidden="true" />
                  </AttachmentMedia>
                )}
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>
                    {formatFileSize(file.sizeBytes)} ·{' '}
                    {file.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                  </AttachmentDescription>
                </AttachmentContent>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      )}

      {folderDialog && (
        <MediaFolderDialog
          key={folderDialog.kind === 'rename' ? folderDialog.folder.id : 'create'}
          mode={folderDialog}
          onOpenChange={(open) => {
            if (!open) setFolderDialog(null);
          }}
          onDone={() => router.refresh()}
        />
      )}

      {activeFile && (
        <MediaFileDialog
          key={activeFile.id}
          file={activeFile}
          folders={folders}
          canManage={canManage}
          onOpenChange={(open) => {
            if (!open) setActiveFile(null);
          }}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}
