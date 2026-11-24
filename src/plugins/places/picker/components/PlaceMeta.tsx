import { PRICE_LABELS, type Place, type Tag } from '@/plugins/places/shared';

export const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

/** "★★★★☆ · Cầu Giấy · Vừa" (or "Muốn thử" instead of stars). */
export function PlaceMeta({ place, tagsById }: { place: Place; tagsById: Map<string, Tag> }) {
  const area = place.areaId ? tagsById.get(place.areaId)?.name : undefined;
  const parts = [
    place.status === 'wishlist' ? 'Muốn thử' : place.rating ? stars(place.rating) : 'Chưa chấm',
    area,
    place.priceLevel ? PRICE_LABELS[place.priceLevel] : undefined,
  ].filter(Boolean);
  return <span className="text-sm text-foreground/80">{parts.join(' · ')}</span>;
}

export function VibeTags({ place, tagsById }: { place: Place; tagsById: Map<string, Tag> }) {
  const names = place.vibeIds.map((id) => tagsById.get(id)?.name).filter(Boolean);
  if (names.length === 0) return null;
  return (
    <span className="text-sm text-foreground/70">
      {names.map((n) => `#${n!.toLowerCase().replace(/\s+/g, '-')}`).join(' ')}
    </span>
  );
}
