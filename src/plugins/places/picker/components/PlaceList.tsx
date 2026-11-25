'use client';

import { TagIcon, primaryCategoryTag, type Place, type Tag } from '@/plugins/places/shared';
import { sortForList } from '../lib/pick';
import { PlaceMeta } from './PlaceMeta';

type Props = { places: Place[]; tagsById: Map<string, Tag>; onOpen: (p: Place) => void };

export function PlaceList({ places, tagsById, onOpen }: Props) {
  if (places.length === 0) return null;
  return (
    <details className="rounded-base border-2 border-border bg-secondary-background">
      <summary className="flex min-h-11 cursor-pointer items-center px-3 font-heading">
        {places.length} quán khớp
      </summary>
      <ul className="divide-y-2 divide-border/10 border-t-2 border-border">
        {sortForList(places).map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onOpen(p)}
              className="flex min-h-11 w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-foreground/5"
            >
              <span className="inline-flex items-center gap-1.5">
                <TagIcon tag={primaryCategoryTag(p, tagsById)} fallbackPin className="size-4" />
                {p.name}
              </span>
              <PlaceMeta place={p} tagsById={tagsById} />
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
