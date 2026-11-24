import { describe, expect, it } from 'vitest';
import { cardEmoji, toPlace, type PlaceRow } from './mapping';
import type { Tag } from './types';

const tags: Tag[] = [
  { id: 'cat1', kind: 'category', name: 'Lẩu', emoji: '🍲', sort: 1 },
  { id: 'cat0', kind: 'category', name: 'Cà phê', emoji: '☕', sort: 0 },
  { id: 'catNull', kind: 'category', name: 'Khác', emoji: null, sort: -1 },
  { id: 'vibe1', kind: 'vibe', name: 'Xưa', emoji: null, sort: 0 },
  { id: 'area1', kind: 'area', name: 'Cầu Giấy', emoji: null, sort: 0 },
];
const tagsById = new Map(tags.map((t) => [t.id, t]));
const publicUrl = (p: string) => `https://cdn/${p}`;

const row = (over: Partial<PlaceRow> = {}): PlaceRow => ({
  id: 'p1',
  name: 'Quán A',
  status: 'visited',
  rating: 4,
  price_level: 2,
  dishes: 'Lẩu bò',
  note: null,
  maps_url: 'https://maps.app.goo.gl/x',
  photos: ['p1/a.jpg'],
  visited_on: '2026-11-20',
  plc_place_tags: [
    { tag_id: 'cat1' },
    { tag_id: 'cat0' },
    { tag_id: 'vibe1' },
    { tag_id: 'area1' },
    { tag_id: 'gone' },
  ],
  ...over,
});

describe('toPlace', () => {
  it('maps columns and splits tags by kind, ignoring unknown tag ids', () => {
    const p = toPlace(row(), tagsById, publicUrl);
    expect(p).toEqual({
      id: 'p1',
      name: 'Quán A',
      status: 'visited',
      rating: 4,
      priceLevel: 2,
      dishes: 'Lẩu bò',
      note: null,
      mapsUrl: 'https://maps.app.goo.gl/x',
      photos: [{ path: 'p1/a.jpg', url: 'https://cdn/p1/a.jpg' }],
      visitedOn: '2026-11-20',
      categoryIds: ['cat1', 'cat0'],
      vibeIds: ['vibe1'],
      areaId: 'area1',
    });
  });

  it('falls back to visited for an unknown status and null for an out-of-range price', () => {
    const p = toPlace(row({ status: 'weird', price_level: 7 }), tagsById, publicUrl);
    expect(p.status).toBe('visited');
    expect(p.priceLevel).toBeNull();
  });
});

describe('cardEmoji', () => {
  it('uses the emoji of the lowest-sort category that has one', () => {
    const p = toPlace(
      row({ plc_place_tags: [{ tag_id: 'cat1' }, { tag_id: 'cat0' }, { tag_id: 'catNull' }] }),
      tagsById,
      publicUrl,
    );
    expect(cardEmoji(p, tagsById)).toBe('☕');
  });

  it('falls back to a pin when there is no category emoji', () => {
    const p = toPlace(row({ plc_place_tags: [{ tag_id: 'catNull' }] }), tagsById, publicUrl);
    expect(cardEmoji(p, tagsById)).toBe('📍');
    const none = toPlace(row({ plc_place_tags: [] }), tagsById, publicUrl);
    expect(cardEmoji(none, tagsById)).toBe('📍');
  });
});
