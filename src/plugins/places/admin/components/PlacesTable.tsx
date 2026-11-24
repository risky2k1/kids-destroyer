'use client';

import { useState } from 'react';
import {
  STATUS_LABELS,
  cardEmoji,
  type Place,
  type PlaceStatus,
  type Tag,
} from '@/plugins/places/shared';
import { PlaceRowActions } from './PlaceRowActions';

type StatusFilter = 'all' | PlaceStatus;
const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'visited', label: STATUS_LABELS.visited },
  { id: 'wishlist', label: STATUS_LABELS.wishlist },
];

const formatDate = (d: string) => d.split('-').reverse().join('/');

export function PlacesTable({ places, tags }: { places: Place[]; tags: Tag[] }) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const tagsById = new Map(tags.map((t) => [t.id, t]));
  const names = (ids: string[]) =>
    ids
      .map((id) => tagsById.get(id)?.name)
      .filter(Boolean)
      .join(', ');
  const shown = filter === 'all' ? places : places.filter((p) => p.status === filter);

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className="min-h-9 rounded-base border-2 border-border px-3 text-sm aria-selected:bg-main aria-selected:text-main-foreground"
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="flex flex-col divide-y-2 divide-border/10 rounded-base border-2 border-border bg-secondary-background">
        {shown.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-heading">
                {cardEmoji(p, tagsById)} {p.name}
              </span>
              <span className="text-sm text-foreground/70">
                {p.status === 'wishlist'
                  ? STATUS_LABELS.wishlist
                  : p.rating
                    ? '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating)
                    : 'Chưa chấm'}
                {[names(p.categoryIds), p.areaId && tagsById.get(p.areaId)?.name]
                  .filter(Boolean)
                  .map((s) => ` · ${s}`)}
                {p.visitedOn && ` · ${formatDate(p.visitedOn)}`}
              </span>
            </div>
            <PlaceRowActions id={p.id} />
          </li>
        ))}
        {shown.length === 0 && (
          <li className="p-3 text-sm text-foreground/60">Không có quán nào.</li>
        )}
      </ul>
    </div>
  );
}
