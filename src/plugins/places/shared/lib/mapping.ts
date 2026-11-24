import type { Place, PriceLevel, Tag } from './types';

export type PlaceRow = {
  id: string;
  name: string;
  status: string;
  rating: number | null;
  price_level: number | null;
  dishes: string | null;
  note: string | null;
  maps_url: string | null;
  photos: string[];
  visited_on: string | null;
  plc_place_tags: { tag_id: string }[];
};

/** Columns every place query selects; matches PlaceRow. */
export const PLACE_SELECT =
  'id, name, status, rating, price_level, dishes, note, maps_url, photos, visited_on, plc_place_tags(tag_id)';

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

  return {
    id: row.id,
    name: row.name,
    status: row.status === 'wishlist' ? 'wishlist' : 'visited',
    rating: row.rating,
    priceLevel: price === 1 || price === 2 || price === 3 ? (price as PriceLevel) : null,
    dishes: row.dishes,
    note: row.note,
    mapsUrl: row.maps_url,
    photos: row.photos.map((path) => ({ path, url: publicUrl(path) })),
    visitedOn: row.visited_on,
    categoryIds: ofKind('category'),
    vibeIds: ofKind('vibe'),
    areaId: ofKind('area')[0] ?? null,
  };
}

/** Emoji of the place's lowest-sort category that has one; a pin otherwise. */
export function cardEmoji(place: Place, tagsById: Map<string, Tag>): string {
  const withEmoji = place.categoryIds
    .map((id) => tagsById.get(id))
    .filter((t): t is Tag => !!t?.emoji)
    .sort((a, b) => a.sort - b.sort);
  return withEmoji[0]?.emoji ?? '📍';
}
