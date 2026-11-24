'use client';

import { cardEmoji, type Place, type Tag } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { PlaceMeta, VibeTags } from './PlaceMeta';

type Props = {
  place: Place;
  tagsById: Map<string, Tag>;
  /** True while names are still flicking past: show only the name. */
  rolling: boolean;
  onOpen: () => void;
  onReshuffle: () => void;
};

export function ShuffleCard({ place, tagsById, rolling, onOpen, onReshuffle }: Props) {
  const dishes = place.dishes
    ?.split('\n')
    .map((d) => d.trim())
    .filter(Boolean)
    .slice(0, 2);
  const photo = place.photos[0];

  return (
    <article
      aria-live="polite"
      className="overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow"
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={rolling}
        className="flex w-full flex-col gap-1.5 p-4 text-left"
      >
        {photo && !rolling && (
          // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
          <img
            src={photo.url}
            alt=""
            className="-mx-4 -mt-4 mb-2 aspect-video w-[calc(100%+2rem)] max-w-none border-b-2 border-border object-cover"
          />
        )}
        <span className="text-2xl font-heading">
          {cardEmoji(place, tagsById)} {place.name}
        </span>
        {!rolling && (
          <>
            <PlaceMeta place={place} tagsById={tagsById} />
            <VibeTags place={place} tagsById={tagsById} />
            {dishes && dishes.length > 0 && (
              <span className="text-sm">Món: {dishes.join(', ')}</span>
            )}
          </>
        )}
      </button>
      {!rolling && (
        <div className="flex gap-2 border-t-2 border-border p-3">
          {place.mapsUrl && (
            <Button
              render={<a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              className="h-11 flex-1"
            >
              Chỉ đường
            </Button>
          )}
          <Button type="button" variant="neutral" onClick={onReshuffle} className="h-11 flex-1">
            Đổi quán
          </Button>
        </div>
      )}
    </article>
  );
}
