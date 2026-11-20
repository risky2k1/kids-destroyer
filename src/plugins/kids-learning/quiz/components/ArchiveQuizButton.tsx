'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { archiveQuiz } from '../actions';

export function ArchiveQuizButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [, formAction, pending] = useActionToast(archiveQuiz, 'Đã lưu trữ');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="neutral" size="sm" className="self-start" />}
      >
        <Trash2 />
        Lưu trữ
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Lưu trữ đề này?</DialogTitle>
        <p className="text-sm text-foreground/70">
          Đề sẽ ẩn khỏi danh sách. Bài đã giao vẫn giữ nguyên.
        </p>
        <form action={formAction} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter className="gap-2">
            <DialogClose render={<Button type="button" variant="neutral" />}>Thôi</DialogClose>
            <Button type="submit" disabled={pending}>
              Lưu trữ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
