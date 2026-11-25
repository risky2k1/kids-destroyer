import { describe, expect, it } from 'vitest';
import { cardEmoji, primaryCategoryTag, toPlace, type PlaceRow } from './mapping';
import type { Tag } from './types';

const tags: Tag[] = [
  { id: 'cat1', kind: 'category', name: 'Lẩu', emoji: '🍲', icon: null, sort: 1 },
  { id: 'cat0', kind: 'category', name: 'Cà phê', emoji: '☕', icon: 'coffee', sort: 0 },
  { id: 'catNull', kind: 'category', name: 'Khác', emoji: null, icon: null, sort: -1 },
  { id: 'vibe1', kind: 'vibe', name: 'Xưa', emoji: null, icon: null, sort: 0 },
  { id: 'area1', kind: 'area', name: 'Cầu Giấy', emoji: null, icon: null, sort: 0 },
];
const tagsById = new Map(tags.map((t) => [t.id, t]));
const publicUrl = (p: string) => `https://cdn/${p}`;

const row = (over: Partial<PlaceRow> = {}): PlaceRow => ({
  id: 'p1',
  name: 'Quán A',
  status: 'visited',
  rating: 3.5,
  price_level: 2,
  dishes: 'Lẩu bò',
  note: null,
  maps_url: 'https://maps.app.goo.gl/x',
  photos: ['p1/a.jpg'],
  visited_on: '2026-11-20',
  open_hours: [{ open: '08:00', close: '22:00' }],
  plc_place_tags: [
    { tag_id: 'cat1' },
    { tag_id: 'cat0' },
    { tag_id: 'vibe1' },
    { tag_id: 'area1' },
    { tag_id: 'gone' },
  ],
  plc_visits: [
    {
      id: 'v1',
      place_id: 'p1',
      visited_at: '2026-11-10T12:00:00Z',
      rating: 5,
      note: 'Ngon',
    },
    {
      id: 'v2',
      place_id: 'p1',
      visited_at: '2026-11-20T12:00:00Z',
      rating: 2,
      note: 'Hơi nguội',
    },
  ],
  ...over,
});

describe('toPlace', () => {
  it('maps columns, sorts visits newest first, and splits tags by kind', () => {
    const p = toPlace(row(), tagsById, publicUrl);
    expect(p).toEqual({
      id: 'p1',
      name: 'Quán A',
      status: 'visited',
      rating: 3.5,
      visitCount: 2,
      visits: [
        {
          id: 'v2',
          placeId: 'p1',
          visitedAt: '2026-11-20T12:00:00Z',
          rating: 2,
          note: 'Hơi nguội',
        },
        {
          id: 'v1',
          placeId: 'p1',
          visitedAt: '2026-11-10T12:00:00Z',
          rating: 5,
          note: 'Ngon',
        },
      ],
      priceLevel: 2,
      dishes: 'Lẩu bò',
      note: null,
      mapsUrl: 'https://maps.app.goo.gl/x',
      photos: [{ path: 'p1/a.jpg', url: 'https://cdn/p1/a.jpg' }],
      visitedOn: '2026-11-20',
      openHours: [{ open: '08:00', close: '22:00' }],
      categoryIds: ['cat1', 'cat0'],
      vibeIds: ['vibe1'],
      areaId: 'area1',
    });
  });

  it('falls back to visited for an unknown status and ignores malformed open_hours', () => {
    const p = toPlace(
      row({ status: 'weird', price_level: 7, open_hours: [{ open: 'bad', close: '10:00' }] }),
      tagsById,
      publicUrl,
    );
    expect(p.status).toBe('visited');
    expect(p.priceLevel).toBeNull();
    expect(p.openHours).toEqual([]);
  });
});

describe('primaryCategoryTag and cardEmoji', () => {
  it('uses the lowest-sort category that has an icon or emoji', () => {
    const p = toPlace(
      row({ plc_place_tags: [{ tag_id: 'cat1' }, { tag_id: 'cat0' }, { tag_id: 'catNull' }] }),
      tagsById,
      publicUrl,
    );
    expect(primaryCategoryTag(p, tagsById)?.id).toBe('cat0');
    expect(cardEmoji(p, tagsById)).toBe('☕');
  });

  it('falls back to null/pin when there is no category icon or emoji', () => {
    const p = toPlace(row({ plc_place_tags: [{ tag_id: 'catNull' }] }), tagsById, publicUrl);
    expect(primaryCategoryTag(p, tagsById)).toBeNull();
    expect(cardEmoji(p, tagsById)).toBe('📍');
  });
});
