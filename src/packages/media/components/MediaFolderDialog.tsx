'use client';

import { useState, useTransition, type FormEvent } from 'react';
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
import { toast } from '@/themes/neobrutal/ui/toast';
import { createFolderAction, renameFolderAction } from '../actions';
import type { MediaFolder, MediaVisibility } from '../lib/types';

type Mode =
  | { kind: 'create'; parentId: string | null; fixedVisibility: MediaVisibility | null }
  | { kind: 'rename'; folder: MediaFolder };

export function MediaFolderDialog({
  mode,
  onOpenChange,
  onDone,
}: {
  mode: Mode | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(mode?.kind === 'rename' ? mode.folder.name : '');
  const [visibility, setVisibility] = useState<MediaVisibility>(
    mode?.kind === 'create' ? (mode.fixedVisibility ?? 'public') : 'public',
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mode) return;
    startTransition(async () => {
      const res =
        mode.kind === 'create'
          ? await createFolderAction({
              parentId: mode.parentId,
              name,
              visibility: mode.fixedVisibility ?? visibility,
            })
          : await renameFolderAction(mode.folder.id, name);

      if (!res.ok) {
        toast.add({ title: res.error ?? 'Không lưu được thư mục', type: 'error' });
        return;
      }
      toast.add({
        title: mode.kind === 'create' ? 'Đã tạo thư mục' : 'Đã đổi tên thư mục',
        type: 'success',
      });
      onOpenChange(false);
      onDone();
    });
  }

  return (
    <Dialog open={mode !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode?.kind === 'rename' ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="folderName">Tên thư mục</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ví dụ: Ảnh bài viết"
              required
              autoFocus
            />
          </div>

          {mode?.kind === 'create' && (
            <div className="flex flex-col gap-1.5">
              <Label>Chế độ truy cập</Label>
              {mode.fixedVisibility ? (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="neutral">
                    {mode.fixedVisibility === 'public' ? 'Công khai' : 'Riêng tư'}
                  </Badge>
                  <span className="text-foreground/60">Kế thừa theo thư mục/tab hiện tại</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  {(['public', 'private'] as const).map((v) => (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={visibility === v ? 'default' : 'neutral'}
                      onClick={() => setVisibility(v)}
                    >
                      {v === 'public' ? 'Công khai' : 'Riêng tư'}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Đang lưu…' : mode?.kind === 'rename' ? 'Lưu' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
