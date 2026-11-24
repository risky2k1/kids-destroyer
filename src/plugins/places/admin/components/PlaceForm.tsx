'use client';

import type { ReactNode } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import {
  PLACE_STATUSES,
  PRICE_LABELS,
  PRICE_LEVELS,
  STATUS_LABELS,
  type Place,
  type Tag,
} from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { savePlace } from '../actions';
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

function TagChips({ name, tags, selected }: { name: string; tags: Tag[]; selected: string[] }) {
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
            defaultChecked={selected.includes(tag.id)}
            className="sr-only"
          />
          {tag.emoji && <span>{tag.emoji}</span>}
          {tag.name}
        </label>
      ))}
    </div>
  );
}

export function PlaceForm({ place, tags }: { place: Place | null; tags: Tag[] }) {
  const [, formAction, pending] = useActionToast(savePlace, 'Đã lưu');
  const ofKind = (kind: Tag['kind']) => tags.filter((t) => t.kind === kind);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {place && <input type="hidden" name="id" value={place.id} />}

      <Field label="Tên quán" htmlFor="name">
        <Input id="name" name="name" defaultValue={place?.name} maxLength={100} required />
      </Field>

      <Field label="Trạng thái">
        <div className="flex gap-4">
          {PLACE_STATUSES.map((s) => (
            <label key={s} className="inline-flex min-h-9 items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value={s}
                defaultChecked={(place?.status ?? 'visited') === s}
                className="size-4"
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Đánh giá">
        <StarInput defaultValue={place?.rating ?? null} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Giá" htmlFor="priceLevel">
          <NativeSelect id="priceLevel" name="priceLevel" defaultValue={place?.priceLevel ?? ''}>
            <option value="">—</option>
            {PRICE_LEVELS.map((p) => (
              <option key={p} value={p}>
                {PRICE_LABELS[p]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Khu vực" htmlFor="areaId">
          <NativeSelect id="areaId" name="areaId" defaultValue={place?.areaId ?? ''}>
            <option value="">—</option>
            {ofKind('area').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>

      <Field label="Loại quán">
        <TagChips
          name="categoryIds"
          tags={ofKind('category')}
          selected={place?.categoryIds ?? []}
        />
      </Field>
      <Field label="Vibe">
        <TagChips name="vibeIds" tags={ofKind('vibe')} selected={place?.vibeIds ?? []} />
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
      <Field label="Ghi chú" htmlFor="note">
        <Textarea
          id="note"
          name="note"
          defaultValue={place?.note ?? ''}
          maxLength={2000}
          rows={3}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <Field label="Ngày đi gần nhất" htmlFor="visitedOn">
          <Input
            id="visitedOn"
            name="visitedOn"
            type="date"
            defaultValue={place?.visitedOn ?? ''}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {place ? 'Lưu' : 'Tạo quán'}
      </Button>
    </form>
  );
}
