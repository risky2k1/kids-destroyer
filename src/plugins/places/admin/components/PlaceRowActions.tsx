'use client';

import { useState } from 'react';
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
import { approvePlace, deletePlace } from '../actions';
import { LogVisitDialog } from './LogVisitDialog';

export function PlaceRowActions({
  id,
  name,
  pendingReview,
}: {
  id: string;
  name: string;
  pendingReview?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {pendingReview ? (
        <>
          <ApproveButton id={id} />
          <RejectButton id={id} name={name} />
        </>
      ) : (
        <LogVisitDialog placeId={id} placeName={name} />
      )}
    </div>
  );
}

function ApproveButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionToast(approvePlace, 'Đã duyệt');
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="xs" disabled={pending}>
        Duyệt
      </Button>
    </form>
  );
}

function RejectButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [, formAction, pending] = useActionToast(deletePlace);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="xs" variant="neutral" />}>
        Từ chối
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Từ chối “{name}”?</DialogTitle>
        <p className="text-sm">Quán sẽ bị xóa.</p>
        <form action={formAction} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter className="gap-2">
            <DialogClose render={<Button type="button" variant="neutral" />}>Thôi</DialogClose>
            <Button type="submit" disabled={pending}>
              Từ chối
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
