'use client';

import {
  TagIcon,
  formatOpeningHours,
  formatVisitDateTime,
  primaryCategoryTag,
  type Place,
  type Tag,
} from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent } from '@/themes/neobrutal/ui/card';
import { Sheet, SheetContent, SheetTitle } from '@/themes/neobrutal/ui/sheet';
import { PlaceMeta, VibeTags } from './PlaceMeta';

type Props = { place: Place | null; tagsById: Map<string, Tag>; onClose: () => void };

export function PlaceDetail({ place, tagsById, onClose }: Props) {
  const categories = place?.categoryIds.map((id) => tagsById.get(id)?.name).filter(Boolean) ?? [];
  const dishes =
    place?.dishes
      ?.split('\n')
      .map((d) => d.trim())
      .filter(Boolean) ?? [];
  const hours = place ? formatOpeningHours(place.openHours) : '';

  return (
    <Sheet open={place !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto p-4">
        {place && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-3 pb-4">
            <SheetTitle className="flex items-center gap-2 pr-8 text-2xl">
              <TagIcon tag={primaryCategoryTag(place, tagsById)} fallbackPin className="size-6" />
              {place.name}
            </SheetTitle>
            <PlaceMeta place={place} tagsById={tagsById} />
            {categories.length > 0 && <span className="text-sm">{categories.join(', ')}</span>}
            <VibeTags place={place} tagsById={tagsById} />
            {hours && <p className="text-sm text-foreground/80">Giờ mở cửa: {hours}</p>}
            {place.photos.length > 0 && (
              <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4">
                {place.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                  <img
                    key={photo.path}
                    src={photo.url}
                    alt=""
                    className="h-48 w-auto shrink-0 snap-start rounded-base border-2 border-border bg-foreground/10 object-cover"
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
            {place.visits.length > 0 && (
              <section className="flex flex-col gap-1.5">
                <h3 className="font-heading">Lịch sử các lần đi ({place.visitCount})</h3>
                <ul className="flex flex-col gap-1.5">
                  {place.visits.slice(0, 5).map((v) => (
                    <li key={v.id}>
                      <Card size="sm" className="bg-secondary-background shadow-none">
                        <CardContent className="text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-heading">{formatVisitDateTime(v.visitedAt)}</span>
                            <Badge variant="neutral">
                              {v.rating
                                ? '★'.repeat(v.rating) + '☆'.repeat(5 - v.rating)
                                : 'Chưa chấm'}
                            </Badge>
                          </div>
                          {v.note && <p className="mt-1 text-foreground/80">{v.note}</p>}
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
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
