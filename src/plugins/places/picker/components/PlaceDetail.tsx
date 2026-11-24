'use client';

import { cardEmoji, type Place, type Tag } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/themes/neobrutal/ui/sheet';
import { PlaceMeta, VibeTags } from './PlaceMeta';

const formatDate = (d: string) => d.split('-').reverse().join('/');

type Props = { place: Place | null; tagsById: Map<string, Tag>; onClose: () => void };

export function PlaceDetail({ place, tagsById, onClose }: Props) {
  const categories = place?.categoryIds.map((id) => tagsById.get(id)?.name).filter(Boolean) ?? [];
  const dishes =
    place?.dishes
      ?.split('\n')
      .map((d) => d.trim())
      .filter(Boolean) ?? [];

  return (
    <Sheet open={place !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto p-4">
        {place && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-3 pb-4">
            <SheetTitle className="pr-8 text-2xl">
              {cardEmoji(place, tagsById)} {place.name}
            </SheetTitle>
            <PlaceMeta place={place} tagsById={tagsById} />
            {categories.length > 0 && <span className="text-sm">{categories.join(', ')}</span>}
            <VibeTags place={place} tagsById={tagsById} />
            {place.photos.length > 0 && (
              <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4">
                {place.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                  <img
                    key={photo.path}
                    src={photo.url}
                    alt=""
                    className="h-48 w-auto shrink-0 snap-start rounded-base border-2 border-border object-cover"
                  />
                ))}
              </div>
            )}
            {dishes.length > 0 && (
              <section>
                <h3 className="font-heading">Món nên gọi</h3>
                <ul className="list-disc pl-5">
                  {dishes.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </section>
            )}
            {place.note && <p className="whitespace-pre-line">{place.note}</p>}
            {place.visitedOn && (
              <p className="text-sm text-foreground/70">
                Lần đi gần nhất: {formatDate(place.visitedOn)}
              </p>
            )}
            {place.mapsUrl && (
              <Button
                render={<a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
                className="h-11"
              >
                Chỉ đường
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
