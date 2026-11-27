import {
  PRICE_LABELS,
  formatOpeningHours,
  formatRatingSummary,
  originLabel,
  type Place,
  type Tag,
} from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';

/** Badges for status/rating, area, price, and opening hours. */
export function PlaceMeta({ place, tagsById }: { place: Place; tagsById: Map<string, Tag> }) {
  const area = place.areaId ? tagsById.get(place.areaId)?.name : undefined;
  const hours = formatOpeningHours(place.openHours) || undefined;
  const score =
    place.status === 'wishlist' ? 'Muốn thử' : formatRatingSummary(place.rating, place.visitCount);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge>{score}</Badge>
      <Badge variant="neutral">{originLabel(place.origin, place.reviewStatus)}</Badge>
      {area && <Badge variant="neutral">{area}</Badge>}
      {place.priceLevel && <Badge variant="neutral">{PRICE_LABELS[place.priceLevel]}</Badge>}
      {hours && <Badge variant="neutral">{hours}</Badge>}
    </div>
  );
}

export function VibeTags({ place, tagsById }: { place: Place; tagsById: Map<string, Tag> }) {
  const names = place.vibeIds.map((id) => tagsById.get(id)?.name).filter(Boolean);
  if (names.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((n) => (
        <Badge key={n} variant="neutral" className="text-foreground/75">
          #{n!.toLowerCase().replace(/\s+/g, '-')}
        </Badge>
      ))}
    </div>
  );
}
