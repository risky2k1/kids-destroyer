export type TagKind = 'category' | 'vibe' | 'area';
export type PlaceStatus = 'visited' | 'wishlist';
export type PriceLevel = 1 | 2 | 3;

export const TAG_KINDS: TagKind[] = ['category', 'vibe', 'area'];
export const PLACE_STATUSES: PlaceStatus[] = ['visited', 'wishlist'];
export const PRICE_LEVELS: PriceLevel[] = [1, 2, 3];

export type OpeningSlot = {
  /** 'HH:MM' 24h format */
  open: string;
  /** 'HH:MM' 24h format; if close <= open (and not both 00:00), wraps past midnight */
  close: string;
};

export type PlaceVisit = {
  id: string;
  placeId: string;
  /** ISO timestamp */
  visitedAt: string;
  rating: number | null;
  note: string | null;
};

export type Tag = {
  id: string;
  kind: TagKind;
  name: string;
  emoji: string | null;
  icon: string | null;
  sort: number;
};

export type Place = {
  id: string;
  name: string;
  status: PlaceStatus;
  /** Average rating across visits (1..5, decimal), or null when unrated. */
  rating: number | null;
  visitCount: number;
  visits: PlaceVisit[];
  priceLevel: PriceLevel | null;
  dishes: string | null;
  note: string | null;
  mapsUrl: string | null;
  photos: { path: string; url: string }[];
  /** 'YYYY-MM-DD' of latest visit */
  visitedOn: string | null;
  openHours: OpeningSlot[];
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
