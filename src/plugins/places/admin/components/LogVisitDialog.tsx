'use client';

import { startTransition, useState, type FormEvent } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { toVietnamDatetimeLocal } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { DateTimePicker } from '@/themes/neobrutal/ui/date-time-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { addVisit } from '../actions';
import { StarInput } from './StarInput';

export function LogVisitDialog({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [open, setOpen] = useState(false);
  const [visitedAt, setVisitedAt] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [, formAction, pending] = useActionToast(addVisit, 'Đã ghi nhận lần đi');

  function handleOpenChange(next: boolean) {
    if (next) {
      setVisitedAt(toVietnamDatetimeLocal());
      setRating(null);
      setNote('');
    }
    setOpen(next);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" size="xs" />}>Vừa đi hôm nay</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận lần đi — {placeName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="placeId" value={placeId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`visitedAt-${placeId}`}>Thời gian</Label>
            <DateTimePicker
              id={`visitedAt-${placeId}`}
              name="visitedAt"
              value={visitedAt}
              onChange={setVisitedAt}
              required
              clearable={false}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Đánh giá lần này</Label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`visitNote-${placeId}`}>Lý do / ghi chú</Label>
            <Textarea
              id={`visitNote-${placeId}`}
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ví dụ: Nay quán hơi đông, đồ ăn vẫn ổn…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Đang lưu…' : 'Lưu lần đi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
