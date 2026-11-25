import {
  isOpenAt,
  resolveFilterMinute,
  type Place,
  type PriceLevel,
  type TimeSlotFilter,
} from '@/plugins/places/shared';

export type PickMode = 'all' | 'visited' | 'wishlist';

export type Filters = {
  mode: PickMode;
  timeSlot: TimeSlotFilter;
  categoryIds: string[];
  vibeIds: string[];
  areaIds: string[];
  prices: PriceLevel[];
  minRating: number | null;
};

export const EMPTY_FILTERS: Filters = {
  mode: 'all',
  timeSlot: 'any',
  categoryIds: [],
  vibeIds: [],
  areaIds: [],
  prices: [],
  minRating: null,
};

export const DEFAULT_FILTERS: Filters = {
  ...EMPTY_FILTERS,
  timeSlot: 'now',
};

/** An empty selection ignores the group; otherwise the place needs at least one selected value. */
const anyOf = <T>(selected: T[], values: T[]) =>
  selected.length === 0 || values.some((v) => selected.includes(v));

function passesRating(p: Place, f: Filters): boolean {
  if (f.minRating === null) return true;
  if (p.status === 'visited' && p.rating !== null) return p.rating >= f.minRating;
  // Wishlist and unrated places have no score to compare; only "Quán quen" demands one.
  return f.mode !== 'visited';
}

export function filterPlaces(places: Place[], f: Filters, nowMinute: number = 12 * 60): Place[] {
  const targetMinute = resolveFilterMinute(f.timeSlot, nowMinute);
  return places.filter(
    (p) =>
      (f.mode === 'all' || p.status === f.mode) &&
      (targetMinute === null || isOpenAt(p.openHours, targetMinute)) &&
      anyOf(f.categoryIds, p.categoryIds) &&
      anyOf(f.vibeIds, p.vibeIds) &&
      anyOf(f.areaIds, p.areaId ? [p.areaId] : []) &&
      anyOf(f.prices, p.priceLevel ? [p.priceLevel] : []) &&
      passesRating(p, f),
  );
}

/** Uniform pick; with 2+ candidates the previous pick is excluded so "Đổi quán" always changes. */
export function pickRandom(
  candidates: Place[],
  previousId: string | null,
  rng: () => number = Math.random,
): Place | null {
  const pool = candidates.length >= 2 ? candidates.filter((p) => p.id !== previousId) : candidates;
  if (pool.length === 0) return null;
  return pool[Math.min(Math.floor(rng() * pool.length), pool.length - 1)];
}

export function sortForList(places: Place[]): Place[] {
  const rank = (p: Place) => (p.status === 'wishlist' ? -2 : (p.rating ?? -1));
  return [...places].sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name, 'vi'));
}

export function isFiltered(f: Filters): boolean {
  return (
    f.mode !== 'all' ||
    f.timeSlot !== 'any' ||
    f.minRating !== null ||
    f.categoryIds.length + f.vibeIds.length + f.areaIds.length + f.prices.length > 0
  );
}
