'use client';

import { startTransition, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import {
  PLACE_STATUSES,
  PRICE_LABELS,
  PRICE_LEVELS,
  STATUS_LABELS,
  TagIcon,
  formatRatingSummary,
  type Place,
  type PlaceStatus,
  type Tag,
} from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent } from '@/themes/neobrutal/ui/card';
import { DateTimePicker } from '@/themes/neobrutal/ui/date-time-picker';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themes/neobrutal/ui/select';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { savePlace } from '../actions';
import { InlineTagCreator } from './InlineTagCreator';
import { OpeningHoursInput } from './OpeningHoursInput';
import { StarInput } from './StarInput';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function TagChips({
  name,
  tags,
  selected,
  onToggle,
}: {
  name: string;
  tags: Tag[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (tags.length === 0) return <p className="text-sm text-foreground/60">Chưa có mục nào.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <label
          key={tag.id}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-base border-2 border-border px-3 text-sm has-checked:bg-main has-checked:text-main-foreground"
        >
          <input
            type="checkbox"
            name={name}
            value={tag.id}
            checked={selected.includes(tag.id)}
            onChange={() => onToggle(tag.id)}
            className="sr-only"
          />
          <TagIcon tag={tag} className="size-4" />
          {tag.name}
        </label>
      ))}
    </div>
  );
}

const toggleId = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

const NONE_OPTION = '__none__';

export function PlaceForm({
  place,
  tags,
  defaultVisitedAt,
}: {
  place: Place | null;
  tags: Tag[];
  defaultVisitedAt: string;
}) {
  const [, formAction, pending] = useActionToast(savePlace, 'Đã lưu');
  const [status, setStatus] = useState<PlaceStatus>(place?.status ?? 'visited');
  const [addedTags, setAddedTags] = useState<Tag[]>([]);
  const [priceLevel, setPriceLevel] = useState<string>(
    place?.priceLevel ? String(place.priceLevel) : '',
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(place?.categoryIds ?? []);
  const [vibeIds, setVibeIds] = useState<string[]>(place?.vibeIds ?? []);
  const [areaId, setAreaId] = useState<string>(place?.areaId ?? '');

  const allTags = useMemo(() => {
    const map = new Map(tags.map((t) => [t.id, t]));
    for (const t of addedTags) {
      if (!map.has(t.id)) map.set(t.id, t);
    }
    return [...map.values()];
  }, [tags, addedTags]);

  const ofKind = (kind: Tag['kind']) => allTags.filter((t) => t.kind === kind);
  const areas = ofKind('area');
  const selectedAreaName = areas.find((a) => a.id === areaId)?.name ?? '—';

  function handleCreatedTag(tag: Tag) {
    setAddedTags((prev) => [...prev, tag]);
    if (tag.kind === 'category') setCategoryIds((prev) => [...new Set([...prev, tag.id])]);
    if (tag.kind === 'vibe') setVibeIds((prev) => [...new Set([...prev, tag.id])]);
    if (tag.kind === 'area') setAreaId(tag.id);
  }

  // Dispatch manually instead of <form action>: React resets an action form after every submit,
  // which would wipe a long form when the server only rejects one field.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4">
      {place && <input type="hidden" name="id" value={place.id} />}

      <Field label="Tên quán" htmlFor="name">
        <Input id="name" name="name" defaultValue={place?.name} maxLength={100} required />
      </Field>

      <Field label="Trạng thái">
        <div className="flex gap-2">
          {PLACE_STATUSES.map((s) => (
            <label
              key={s}
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 text-sm has-checked:bg-main has-checked:font-heading has-checked:text-main-foreground"
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="sr-only"
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </Field>

      {place ? (
        <Card size="sm" className="bg-secondary-background shadow-none">
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-heading">Đánh giá trung bình:</span>
            <Badge>{formatRatingSummary(place.rating, place.visitCount)}</Badge>
            <span className="text-foreground/60">
              (tính tự động từ lịch sử các lần đi ở bên dưới)
            </span>
          </CardContent>
        </Card>
      ) : (
        status === 'visited' && (
          <Card size="sm" className="bg-secondary-background shadow-none">
            <CardContent className="flex flex-col gap-3">
              <span className="text-sm font-heading">Lần đi đầu tiên (tùy chọn)</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Thời gian đi" htmlFor="visitedOn">
                  <DateTimePicker id="visitedOn" name="visitedOn" defaultValue={defaultVisitedAt} />
                </Field>
                <Field label="Đánh giá lần này">
                  <StarInput defaultValue={null} />
                </Field>
              </div>
              <Field label="Cảm nhận / lý do lần này" htmlFor="visitNote">
                <Input
                  id="visitNote"
                  name="visitNote"
                  maxLength={1000}
                  placeholder="Ví dụ: Nước dùng đậm đà, phục vụ nhanh…"
                />
              </Field>
            </CardContent>
          </Card>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Giá" htmlFor="priceLevel">
          <input type="hidden" name="priceLevel" value={priceLevel} />
          <Select
            value={priceLevel || NONE_OPTION}
            onValueChange={(v) => setPriceLevel(!v || v === NONE_OPTION ? '' : v)}
          >
            <SelectTrigger id="priceLevel" className="bg-secondary-background text-foreground">
              <SelectValue>
                {priceLevel ? PRICE_LABELS[Number(priceLevel) as 1 | 2 | 3] : '—'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_OPTION}>—</SelectItem>
              {PRICE_LEVELS.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {PRICE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Khu vực" htmlFor="areaId">
          <div className="flex flex-col gap-2">
            <input type="hidden" name="areaId" value={areaId} />
            <Select
              value={areaId || NONE_OPTION}
              onValueChange={(v) => setAreaId(!v || v === NONE_OPTION ? '' : v)}
            >
              <SelectTrigger id="areaId" className="bg-secondary-background text-foreground">
                <SelectValue>{selectedAreaName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_OPTION}>—</SelectItem>
                {areas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InlineTagCreator kind="area" onCreated={handleCreatedTag} />
          </div>
        </Field>
      </div>

      <Field label="Loại quán">
        <TagChips
          name="categoryIds"
          tags={ofKind('category')}
          selected={categoryIds}
          onToggle={(id) => setCategoryIds((prev) => toggleId(prev, id))}
        />
        <InlineTagCreator kind="category" onCreated={handleCreatedTag} />
      </Field>

      <Field label="Vibe">
        <TagChips
          name="vibeIds"
          tags={ofKind('vibe')}
          selected={vibeIds}
          onToggle={(id) => setVibeIds((prev) => toggleId(prev, id))}
        />
        <InlineTagCreator kind="vibe" onCreated={handleCreatedTag} />
      </Field>

      <Field label="Giờ mở cửa">
        <OpeningHoursInput defaultValue={place?.openHours ?? []} />
      </Field>

      <Field label="Món nên gọi (mỗi dòng một món)" htmlFor="dishes">
        <Textarea
          id="dishes"
          name="dishes"
          defaultValue={place?.dishes ?? ''}
          maxLength={1000}
          rows={3}
        />
      </Field>
      <Field label="Ghi chú chung về quán" htmlFor="note">
        <Textarea
          id="note"
          name="note"
          defaultValue={place?.note ?? ''}
          maxLength={2000}
          rows={3}
        />
      </Field>

      <Field label="Link Google Maps" htmlFor="mapsUrl">
        <Input
          id="mapsUrl"
          name="mapsUrl"
          type="url"
          inputMode="url"
          placeholder="https://maps.app.goo.gl/…"
          defaultValue={place?.mapsUrl ?? ''}
        />
      </Field>

      <Button type="submit" disabled={pending} className="w-fit">
        {place ? 'Lưu' : 'Tạo quán'}
      </Button>
    </form>
  );
}
