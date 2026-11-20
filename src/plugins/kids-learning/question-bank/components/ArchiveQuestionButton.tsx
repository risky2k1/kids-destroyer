'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { useActionToast } from '@/core/ui/useActionToast';
import { archiveQuestion } from '../actions';

export function ArchiveQuestionButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [, formAction, pending] = useActionToast(archiveQuestion, 'Đã lưu trữ');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="neutral" size="sm" className="self-start" />}
      >
        <Trash2 />
        Lưu trữ
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Lưu trữ câu này?</DialogTitle>
        <p className="text-sm text-foreground/70">
          Câu sẽ ẩn khỏi ngân hàng và khỏi danh sách chọn vào đề.
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
