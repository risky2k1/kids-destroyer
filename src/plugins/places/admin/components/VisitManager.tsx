'use client';

import { startTransition, useState, type FormEvent } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { useActionToast } from '@/core/ui/useActionToast';
import {
  formatRatingSummary,
  formatVisitDateTime,
  toVietnamDatetimeLocal,
  type Place,
  type PlaceVisit,
} from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent } from '@/themes/neobrutal/ui/card';
import { DateTimePicker } from '@/themes/neobrutal/ui/date-time-picker';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/themes/neobrutal/ui/tooltip';
import { addVisit, deleteVisit, updateVisit } from '../actions';
import { StarInput } from './StarInput';

function VisitRow({ visit, placeId }: { visit: PlaceVisit; placeId: string }) {
  const [editing, setEditing] = useState(false);
  const [, formAction, saving] = useActionToast(updateVisit, 'Đã cập nhật lần đi');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <li>
        <Card size="sm" className="shadow-none">
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={visit.id} />
              <input type="hidden" name="placeId" value={placeId} />
              <div className="flex flex-wrap items-center gap-3">
                <DateTimePicker
                  name="visitedAt"
                  defaultValue={toVietnamDatetimeLocal(visit.visitedAt)}
                  required
                  clearable={false}
                  className="w-56"
                />
                <StarInput defaultValue={visit.rating} size="sm" />
              </div>
              <Textarea
                name="note"
                defaultValue={visit.note ?? ''}
                maxLength={1000}
                rows={2}
                placeholder="Lý do / cảm nhận lần đi này…"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  Lưu
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  onClick={() => setEditing(false)}
                  className="gap-1"
                >
                  <X className="size-3.5" /> Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </li>
    );
  }

  return (
    <li className="group/row">
      <Card size="sm" className="bg-secondary-background shadow-none">
        <CardContent className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-heading">{formatVisitDateTime(visit.visitedAt)}</span>
              <Badge variant="neutral">
                {visit.rating
                  ? '★'.repeat(visit.rating) + '☆'.repeat(5 - visit.rating)
                  : 'Chưa chấm'}
              </Badge>
            </div>
            {visit.note && <p className="text-sm text-foreground/80">{visit.note}</p>}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="neutral"
                    aria-label="Sửa lần đi"
                    onClick={() => setEditing(true)}
                  />
                }
              >
                <Pencil />
              </TooltipTrigger>
              <TooltipContent>Sửa lần đi</TooltipContent>
            </Tooltip>
            <div className="[&_button]:opacity-100">
              <ConfirmDelete id={visit.id} label="lần đi này" action={deleteVisit} />
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

export function VisitManager({
  place,
  defaultVisitedAt,
}: {
  place: Place;
  defaultVisitedAt: string;
}) {
  const [, formAction, adding] = useActionToast(addVisit, 'Đã thêm lần đi');
  const [visitedAt, setVisitedAt] = useState(defaultVisitedAt);
  const [note, setNote] = useState('');
  const [ratingKey, setRatingKey] = useState(0);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
      setNote('');
      setRatingKey((k) => k + 1);
    });
  }

  return (
    <section className="flex max-w-2xl flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label className="text-base font-heading">Lịch sử các lần đi ({place.visitCount})</Label>
        <Badge>Trung bình: {formatRatingSummary(place.rating, place.visitCount)}</Badge>
      </div>

      <Card size="sm" className="bg-secondary-background shadow-none">
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
            <input type="hidden" name="placeId" value={place.id} />
            <span className="text-sm font-heading">Ghi nhận lần đi mới</span>
            <div className="flex flex-wrap items-center gap-3">
              <DateTimePicker
                name="visitedAt"
                value={visitedAt}
                onChange={setVisitedAt}
                required
                clearable={false}
                className="w-56"
              />
              <StarInput key={ratingKey} defaultValue={null} size="sm" />
            </div>
            <Textarea
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Lý do đánh giá lần này (ví dụ: nay đông, phục vụ chậm / đồ ăn ngon hơn trước)…"
            />
            <Button type="submit" size="sm" disabled={adding} className="w-fit gap-1">
              <Plus className="size-4" /> {adding ? 'Đang lưu…' : 'Thêm lần đi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {place.visits.length === 0 ? (
        <p className="text-sm text-foreground/60">Chưa có lần đi nào được ghi nhận.</p>
      ) : (
        <TooltipProvider delay={200}>
          <ul className="flex flex-col gap-2">
            {place.visits.map((v) => (
              <VisitRow key={v.id} visit={v} placeId={place.id} />
            ))}
          </ul>
        </TooltipProvider>
      )}
    </section>
  );
}
