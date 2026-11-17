'use client';

import { useState } from 'react';
import type { ActionState } from '@/core/actions';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { useActionToast } from './useActionToast';

type Props = {
  id: string;
  label: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

/** Delete button with a confirmation dialog; posts `id` to the action. */
export function ConfirmDelete({ id, label, action }: Props) {
  const [open, setOpen] = useState(false);
  const [, formAction, pending] = useActionToast(action, 'Đã xóa');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="neutral" size="sm" aria-label={`Xóa ${label}`} />}>
        Xóa
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Xóa “{label}”?</DialogTitle>
        <form action={formAction} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter className="gap-2">
            <DialogClose render={<Button type="button" variant="neutral" />}>Thôi</DialogClose>
            <Button type="submit" disabled={pending}>
              Xóa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
