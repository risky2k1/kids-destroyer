'use client';

import { useMemo, useState } from 'react';
import type { Place, Tag } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { EMPTY_FILTERS, filterPlaces, isFiltered, type Filters } from '../lib/pick';
import { FilterBar } from './FilterBar';
import { PlaceDetail } from './PlaceDetail';
import { PlaceList } from './PlaceList';
import { ShuffleCard } from './ShuffleCard';
import { useShuffle } from './useShuffle';

export function Picker({ places, tags }: { places: Place[]; tags: Tag[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [detail, setDetail] = useState<Place | null>(null);
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const matching = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const { current, rolling, shuffle } = useShuffle(matching);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 bg-background px-4 py-6">
      <h1 className="text-3xl font-heading">Đi đâu giờ? 🎲</h1>

      {places.length === 0 ? (
        <p className="rounded-base border-2 border-border bg-secondary-background p-4">
          Chưa có quán nào.
        </p>
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} tags={tags} />

          {matching.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-base border-2 border-border bg-secondary-background p-4">
              <p>Không có quán nào khớp.</p>
              {isFiltered(filters) && (
                <Button type="button" variant="neutral" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Bỏ bớt lọc
                </Button>
              )}
            </div>
          ) : (
            <>
              {current && (
                <ShuffleCard
                  place={current}
                  tagsById={tagsById}
                  rolling={rolling}
                  onOpen={() => setDetail(current)}
                  onReshuffle={shuffle}
                />
              )}
              <Button
                type="button"
                onClick={shuffle}
                disabled={rolling}
                className="h-16 w-full text-xl font-heading"
              >
                XÁO QUÁN! 🎲
              </Button>
            </>
          )}

          <PlaceList places={matching} tagsById={tagsById} onOpen={setDetail} />
        </>
      )}

      <PlaceDetail place={detail} tagsById={tagsById} onClose={() => setDetail(null)} />
    </main>
  );
}
