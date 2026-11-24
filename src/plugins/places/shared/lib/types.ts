export type TagKind = 'category' | 'vibe' | 'area';
export type PlaceStatus = 'visited' | 'wishlist';
export type PriceLevel = 1 | 2 | 3;

export const TAG_KINDS: TagKind[] = ['category', 'vibe', 'area'];
export const PLACE_STATUSES: PlaceStatus[] = ['visited', 'wishlist'];
export const PRICE_LEVELS: PriceLevel[] = [1, 2, 3];

export type Tag = { id: string; kind: TagKind; name: string; emoji: string | null; sort: number };

export type Place = {
  id: string;
  name: string;
  status: PlaceStatus;
  rating: number | null;
  priceLevel: PriceLevel | null;
  dishes: string | null;
  note: string | null;
  mapsUrl: string | null;
  photos: { path: string; url: string }[];
  /** 'YYYY-MM-DD' */
  visitedOn: string | null;
  categoryIds: string[];
  vibeIds: string[];
  areaId: string | null;
};

export const PRICE_LABELS: Record<PriceLevel, string> = { 1: 'Rẻ', 2: 'Vừa', 3: 'Sang' };
export const STATUS_LABELS: Record<PlaceStatus, string> = {
  visited: 'Đã đi',
  wishlist: 'Muốn thử',
};
export const TAG_KIND_LABELS: Record<TagKind, string> = {
  category: 'Loại quán',
  vibe: 'Vibe',
  area: 'Khu vực',
};
