'use client';

import { useMemo, useState } from 'react';
import {
  formatClockInVietnam,
  nowMinutesInVietnam,
  type Place,
  type Tag,
} from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  DEFAULT_FILTERS,
  EMPTY_FILTERS,
  filterPlaces,
  isFiltered,
  type Filters,
} from '../lib/pick';
import { FilterBar } from './FilterBar';
import { PlaceDetail } from './PlaceDetail';
import { PlaceList } from './PlaceList';
import { ShuffleCard } from './ShuffleCard';
import { SuggestForm } from './SuggestForm';
import { useShuffle } from './useShuffle';

export function Picker({
  places,
  tags,
  initialNowMinute,
  initialClock,
}: {
  places: Place[];
  tags: Tag[];
  initialNowMinute: number;
  initialClock: string;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [nowMinute, setNowMinute] = useState(initialNowMinute);
  const [clockLabel, setClockLabel] = useState(initialClock);
  const [detail, setDetail] = useState<Place | null>(null);
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const matching = useMemo(
    () => filterPlaces(places, filters, nowMinute),
    [places, filters, nowMinute],
  );
  const { current, rolling, shuffle } = useShuffle(matching);

  function handleFilterChange(next: Filters) {
    if (next.timeSlot === 'now') {
      setNowMinute(nowMinutesInVietnam());
      setClockLabel(formatClockInVietnam());
    }
    setFilters(next);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 bg-background px-4 py-6">
      <h1 className="text-3xl font-heading">Đi đâu giờ?</h1>

      {places.length === 0 ? (
        <p className="rounded-base border-2 border-border bg-secondary-background p-4">
          Chưa có quán nào.
        </p>
      ) : (
        <>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            tags={tags}
            clockLabel={clockLabel}
          />

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
                XÁO QUÁN!
              </Button>
            </>
          )}

          <PlaceList places={matching} tagsById={tagsById} onOpen={setDetail} />
        </>
      )}

      <details className="rounded-base border-2 border-border bg-secondary-background">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 font-heading">
          Đề xuất quán
        </summary>
        <div className="border-t-2 border-border p-3">
          <SuggestForm tags={tags} />
        </div>
      </details>

      <PlaceDetail place={detail} tagsById={tagsById} onClose={() => setDetail(null)} />
    </main>
  );
}
