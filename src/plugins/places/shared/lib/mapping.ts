import { parseTimeMinutes } from './hours';
import type { OpeningSlot, Place, PlaceVisit, PriceLevel, Tag } from './types';

export type VisitRow = {
  id: string;
  place_id: string;
  visited_at: string;
  rating: number | null;
  note: string | null;
};

export type PlaceRow = {
  id: string;
  name: string;
  status: string;
  origin: string;
  review_status: string;
  rating: number | null;
  price_level: number | null;
  dishes: string | null;
  note: string | null;
  maps_url: string | null;
  photos: string[];
  visited_on: string | null;
  open_hours: unknown;
  plc_place_tags: { tag_id: string }[];
  plc_visits?: VisitRow[];
};

/** Columns every place query selects; matches PlaceRow. */
export const PLACE_SELECT =
  'id, name, status, origin, review_status, rating, price_level, dishes, note, maps_url, photos, visited_on, open_hours, plc_place_tags(tag_id), plc_visits(id, place_id, visited_at, rating, note)';

export function parseOpenHours(raw: unknown): OpeningSlot[] {
  if (!Array.isArray(raw)) return [];
  const valid: OpeningSlot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const open = (item as Record<string, unknown>).open;
    const close = (item as Record<string, unknown>).close;
    if (
      typeof open === 'string' &&
      typeof close === 'string' &&
      parseTimeMinutes(open) !== null &&
      parseTimeMinutes(close) !== null
    ) {
      valid.push({ open, close });
    }
  }
  return valid;
}

export function toPlace(
  row: PlaceRow,
  tagsById: Map<string, Tag>,
  publicUrl: (path: string) => string,
): Place {
  const linked = row.plc_place_tags
    .map((link) => tagsById.get(link.tag_id))
    .filter((tag): tag is Tag => tag !== undefined);
  const ofKind = (kind: Tag['kind']) => linked.filter((t) => t.kind === kind).map((t) => t.id);
  const price = row.price_level;
  const visits: PlaceVisit[] = (row.plc_visits ?? [])
    .map((v) => ({
      id: v.id,
      placeId: v.place_id,
      visitedAt: v.visited_at,
      rating: v.rating,
      note: v.note,
    }))
    .sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt));

  return {
    id: row.id,
    name: row.name,
    status: row.status === 'wishlist' ? 'wishlist' : 'visited',
    origin: row.origin === 'community' ? 'community' : 'admin',
    reviewStatus: row.review_status === 'pending' ? 'pending' : 'approved',
    rating: row.rating !== null ? Number(row.rating) : null,
    visitCount: visits.length,
    visits,
    priceLevel: price === 1 || price === 2 || price === 3 ? (price as PriceLevel) : null,
    dishes: row.dishes,
    note: row.note,
    mapsUrl: row.maps_url,
    photos: row.photos.map((path) => ({ path, url: publicUrl(path) })),
    visitedOn: row.visited_on,
    openHours: parseOpenHours(row.open_hours),
    categoryIds: ofKind('category'),
    vibeIds: ofKind('vibe'),
    areaId: ofKind('area')[0] ?? null,
  };
}

/** Lowest-sort category that has a Lucide icon or emoji. */
export function primaryCategoryTag(place: Place, tagsById: Map<string, Tag>): Tag | null {
  const candidates = place.categoryIds
    .map((id) => tagsById.get(id))
    .filter((t): t is Tag => !!(t?.icon || t?.emoji))
    .sort((a, b) => a.sort - b.sort);
  return candidates[0] ?? null;
}

/** Emoji of the place's lowest-sort category that has one; a pin otherwise. */
export function cardEmoji(place: Place, tagsById: Map<string, Tag>): string {
  const withEmoji = place.categoryIds
    .map((id) => tagsById.get(id))
    .filter((t): t is Tag => !!t?.emoji)
    .sort((a, b) => a.sort - b.sort);
  return withEmoji[0]?.emoji ?? '📍';
}
