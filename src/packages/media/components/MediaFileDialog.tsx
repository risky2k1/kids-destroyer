'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Copy, ExternalLink, FileText, Trash2 } from 'lucide-react';
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
import { Label } from '@/themes/neobrutal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themes/neobrutal/ui/select';
import { toast } from '@/themes/neobrutal/ui/toast';
import {
  createPrivateReadUrlAction,
  deleteMediaFileAction,
  updateMediaFileAction,
} from '../actions';
import { formatFileSize, isImageMime } from '../lib/files';
import type { MediaFileItem, MediaFolder } from '../lib/types';

const ROOT_VALUE = '__root__';

export function MediaFileDialog({
  file,
  folders,
  canManage,
  onOpenChange,
  onDone,
}: {
  file: MediaFileItem | null;
  folders: MediaFolder[];
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(file?.name ?? '');
  const [alt, setAlt] = useState(file?.alt ?? '');
  const [folderId, setFolderId] = useState<string>(file?.folderId ?? ROOT_VALUE);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!file) return null;

  const sameVisibilityFolders = folders.filter((f) => f.visibility === file.visibility);
  const selectedFolderName =
    folderId === ROOT_VALUE
      ? 'Thư mục gốc'
      : (sameVisibilityFolders.find((f) => f.id === folderId)?.name ?? 'Thư mục gốc');
  const isImg = isImageMime(file.mimeType);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Đã sao chép ${label}`, type: 'success' });
    } catch {
      toast.add({ title: 'Không sao chép được vào clipboard', type: 'error' });
    }
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    startTransition(async () => {
      const res = await updateMediaFileAction(file.id, {
        name,
        alt: alt.trim() || null,
        folderId: folderId === ROOT_VALUE ? null : folderId,
      });
      if (!res.ok) {
        toast.add({ title: res.error ?? 'Không cập nhật được tệp', type: 'error' });
        return;
      }
      toast.add({ title: 'Đã cập nhật thông tin tệp', type: 'success' });
      onOpenChange(false);
      onDone();
    });
  }

  function handleDelete() {
    if (!file) return;
    startTransition(async () => {
      const res = await deleteMediaFileAction(file.id);
      if (!res.ok) {
        toast.add({ title: res.error ?? 'Không xoá được tệp', type: 'error' });
        return;
      }
      toast.add({ title: 'Đã xoá tệp', type: 'success' });
      onOpenChange(false);
      onDone();
    });
  }

  function handlePrivateLink() {
    if (!file) return;
    startTransition(async () => {
      const res = await createPrivateReadUrlAction(file.id);
      if (!res.ok || !res.url) {
        toast.add({ title: res.error ?? 'Không tạo được liên kết tải', type: 'error' });
        return;
      }
      setSignedUrl(res.url);
    });
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{file.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-base border-2 border-border bg-foreground/10">
            {isImg && file.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
              <img src={file.url} alt={file.alt ?? ''} className="size-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-foreground/60">
                <FileText className="size-10" />
                <span className="text-xs">{file.mimeType}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge>{file.visibility === 'public' ? 'Công khai' : 'Riêng tư'}</Badge>
            <Badge variant="neutral">{formatFileSize(file.sizeBytes)}</Badge>
            {file.width && file.height && (
              <Badge variant="neutral">
                {file.width}×{file.height}px
              </Badge>
            )}
            <Badge variant="neutral">Kho: {file.driver}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {file.visibility === 'public' && file.url ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  onClick={() => void copyText(file.url!, 'URL công khai')}
                >
                  <Copy className="size-4" />
                  Sao chép URL
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  render={<a href={file.url} target="_blank" rel="noopener noreferrer" />}
                  nativeButton={false}
                >
                  <ExternalLink className="size-4" />
                  Mở tệp
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  disabled={pending}
                  onClick={handlePrivateLink}
                >
                  <ExternalLink className="size-4" />
                  Tạo link tải tạm (10 phút)
                </Button>
                {signedUrl && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="neutral"
                      onClick={() => void copyText(signedUrl, 'link tải tạm')}
                    >
                      <Copy className="size-4" />
                      Chép link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      render={<a href={signedUrl} target="_blank" rel="noopener noreferrer" />}
                      nativeButton={false}
                    >
                      Tải về
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          <form
            onSubmit={handleSave}
            className="flex flex-col gap-3 border-t-2 border-border/15 pt-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mediaFileName">Tên hiển thị</Label>
              <Input
                id="mediaFileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={160}
                disabled={!canManage}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mediaFileAlt">Mô tả ảnh (Alt text)</Label>
              <Input
                id="mediaFileAlt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                maxLength={300}
                placeholder="Mô tả ngắn cho SEO / người khiếm thị…"
                disabled={!canManage}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mediaFileFolder">Thư mục</Label>
              <Select
                value={folderId}
                onValueChange={(v) => setFolderId(v ?? ROOT_VALUE)}
                disabled={!canManage}
              >
                <SelectTrigger id="mediaFileFolder" className="bg-secondary-background">
                  <SelectValue>{selectedFolderName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROOT_VALUE}>Thư mục gốc</SelectItem>
                  {sameVisibilityFolders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              {canManage &&
                (confirmDelete ? (
                  <div className="mr-auto flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="neutral"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Giữ lại
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={handleDelete}
                      className="bg-red-500 text-white"
                    >
                      Xác nhận xoá
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="neutral"
                    onClick={() => setConfirmDelete(true)}
                    className="mr-auto"
                  >
                    <Trash2 className="size-4" />
                    Xoá tệp
                  </Button>
                ))}
              <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              {canManage && (
                <Button type="submit" disabled={pending}>
                  {pending ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
