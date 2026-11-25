import { describe, expect, it } from 'vitest';
import type { Place } from '@/plugins/places/shared';
import {
  DEFAULT_FILTERS,
  EMPTY_FILTERS,
  filterPlaces,
  isFiltered,
  pickRandom,
  sortForList,
  type Filters,
} from './pick';

const place = (id: string, over: Partial<Place> = {}): Place => ({
  id,
  name: id,
  status: 'visited',
  rating: null,
  visitCount: 0,
  visits: [],
  priceLevel: null,
  dishes: null,
  note: null,
  mapsUrl: null,
  photos: [],
  visitedOn: null,
  openHours: [],
  categoryIds: [],
  vibeIds: [],
  areaId: null,
  ...over,
});

const f = (over: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...over });
const ids = (places: Place[]) => places.map((p) => p.id);

describe('filterPlaces', () => {
  const lau = place('lau', {
    categoryIds: ['c-lau'],
    areaId: 'a-cg',
    priceLevel: 2,
    rating: 5,
    openHours: [{ open: '17:00', close: '23:00' }],
  });
  const nuong = place('nuong', {
    categoryIds: ['c-nuong'],
    areaId: 'a-hk',
    rating: 3,
    openHours: [{ open: '18:00', close: '02:00' }],
  });
  const cafe = place('cafe', {
    categoryIds: ['c-cafe'],
    vibeIds: ['v-xua'],
    openHours: [{ open: '06:00', close: '21:00' }],
  });
  const wish = place('wish', { status: 'wishlist', categoryIds: ['c-lau'], areaId: 'a-cg' });
  const all = [lau, nuong, cafe, wish];

  it('returns everything with empty filters', () => {
    expect(ids(filterPlaces(all, EMPTY_FILTERS))).toEqual(['lau', 'nuong', 'cafe', 'wish']);
  });

  it('excludes daytime-only places at night and keeps overnight & unknown-hours places', () => {
    // 23:30 = 1410 mins: lau (17:00-23:00) closed, cafe (06:00-21:00) closed, nuong (18:00-02:00) open, wish ([]) passes
    expect(ids(filterPlaces(all, DEFAULT_FILTERS, 23 * 60 + 30))).toEqual(['nuong', 'wish']);
    expect(ids(filterPlaces(all, f({ timeSlot: 'night' })))).toEqual(['nuong', 'wish']);
    expect(ids(filterPlaces(all, f({ timeSlot: 'morning' })))).toEqual(['cafe', 'wish']);
  });

  it('ORs within a group', () => {
    expect(ids(filterPlaces(all, f({ categoryIds: ['c-lau', 'c-nuong'] })))).toEqual([
      'lau',
      'nuong',
      'wish',
    ]);
  });

  it('ANDs across groups', () => {
    expect(
      ids(filterPlaces(all, f({ categoryIds: ['c-lau'], areaIds: ['a-cg'], mode: 'visited' }))),
    ).toEqual(['lau']);
  });

  it('drops places with no value in a filtered group', () => {
    expect(ids(filterPlaces(all, f({ areaIds: ['a-cg', 'a-hk'] })))).toEqual([
      'lau',
      'nuong',
      'wish',
    ]);
    expect(ids(filterPlaces(all, f({ prices: [2] })))).toEqual(['lau']);
    expect(ids(filterPlaces(all, f({ vibeIds: ['v-xua'] })))).toEqual(['cafe']);
  });

  it('applies minRating only to rated visited places in "all" mode', () => {
    expect(ids(filterPlaces(all, f({ minRating: 4 })))).toEqual(['lau', 'cafe', 'wish']);
  });

  it('supports decimal average ratings against minRating', () => {
    const avg35 = place('avg35', { rating: 3.5 });
    const avg43 = place('avg43', { rating: 4.33 });
    expect(ids(filterPlaces([avg35, avg43], f({ minRating: 4, mode: 'visited' })))).toEqual([
      'avg43',
    ]);
    expect(ids(filterPlaces([avg35, avg43], f({ minRating: 3, mode: 'visited' })))).toEqual([
      'avg35',
      'avg43',
    ]);
  });

  it('drops unrated places for minRating in "visited" mode', () => {
    expect(ids(filterPlaces(all, f({ minRating: 4, mode: 'visited' })))).toEqual(['lau']);
  });

  it('filters by mode', () => {
    expect(ids(filterPlaces(all, f({ mode: 'wishlist' })))).toEqual(['wish']);
    expect(ids(filterPlaces(all, f({ mode: 'visited' })))).toEqual(['lau', 'nuong', 'cafe']);
  });

  it('handles an empty list', () => {
    expect(filterPlaces([], EMPTY_FILTERS)).toEqual([]);
  });
});

describe('pickRandom', () => {
  const a = place('a');
  const b = place('b');
  const c = place('c');

  it('returns null for no candidates', () => {
    expect(pickRandom([], null)).toBeNull();
  });

  it('returns the only candidate even if it was the previous pick', () => {
    expect(pickRandom([a], 'a')).toBe(a);
  });

  it('never repeats the previous pick when there are 2+ candidates', () => {
    expect(pickRandom([a, b], 'a', () => 0)).toBe(b);
    expect(pickRandom([a, b], 'b', () => 0.99)).toBe(a);
  });

  it('indexes uniformly with the rng', () => {
    expect(pickRandom([a, b, c], null, () => 0.5)).toBe(b);
    expect(pickRandom([a, b, c], null, () => 0)).toBe(a);
    expect(pickRandom([a, b, c], null, () => 0.999)).toBe(c);
  });
});

describe('sortForList', () => {
  it('puts visited first by rating desc (unrated last), then wishlist, ties by name', () => {
    const list = [
      place('w', { status: 'wishlist', name: 'Bánh' }),
      place('u', { name: 'Ăn' }),
      place('r3', { rating: 3, name: 'Cơm' }),
      place('r5b', { rating: 5, name: 'Đậu' }),
      place('r5a', { rating: 5, name: 'Bún' }),
      place('w2', { status: 'wishlist', name: 'Ấm' }),
    ];
    expect(ids(sortForList(list))).toEqual(['r5a', 'r5b', 'r3', 'u', 'w2', 'w']);
  });

  it('does not mutate its input', () => {
    const list = [place('b', { rating: 1 }), place('a', { rating: 5 })];
    sortForList(list);
    expect(ids(list)).toEqual(['b', 'a']);
  });
});

describe('isFiltered', () => {
  it('is false only for the empty filters', () => {
    expect(isFiltered(EMPTY_FILTERS)).toBe(false);
    expect(isFiltered(DEFAULT_FILTERS)).toBe(true);
    expect(isFiltered(f({ minRating: 3 }))).toBe(true);
    expect(isFiltered(f({ mode: 'wishlist' }))).toBe(true);
    expect(isFiltered(f({ prices: [1] }))).toBe(true);
  });
});
