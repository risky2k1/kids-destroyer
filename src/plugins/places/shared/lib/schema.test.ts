import { describe, expect, it } from 'vitest';
import { placeFormValues, placeInput, tagInput, visitInput } from './schema';

const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';

function form(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    for (const item of Array.isArray(v) ? v : [v]) fd.append(k, item);
  }
  return fd;
}

const parse = (fields: Record<string, string | string[]>) =>
  placeInput.safeParse(placeFormValues(form(fields)));

describe('placeInput', () => {
  it('parses a minimal form, trimming the name and defaulting optionals to null/[]', () => {
    const r = parse({ name: '  Lẩu Bò  ', status: 'visited' });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({
      name: 'Lẩu Bò',
      status: 'visited',
      rating: null,
      priceLevel: null,
      dishes: null,
      note: null,
      mapsUrl: null,
      visitedOn: null,
      visitNote: null,
      openHours: [],
      categoryIds: [],
      vibeIds: [],
      areaId: null,
    });
  });

  it('turns empty strings into null', () => {
    const r = parse({
      name: 'A',
      status: 'wishlist',
      rating: '',
      priceLevel: '',
      mapsUrl: '',
      visitedOn: '',
      visitNote: '',
      openHours: '',
      areaId: '',
      dishes: '  ',
      note: '',
    });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({
      rating: null,
      priceLevel: null,
      mapsUrl: null,
      visitedOn: null,
      visitNote: null,
      openHours: [],
      areaId: null,
      dishes: null,
      note: null,
    });
  });

  it('parses numbers, dates, datetime-local, and opening hours', () => {
    const r = parse({
      name: 'A',
      status: 'visited',
      rating: '4',
      priceLevel: '3',
      visitedOn: '2026-11-24T19:30',
      visitNote: 'Ngon',
      openHours: JSON.stringify([{ open: '18:00', close: '02:00' }]),
    });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({
      rating: 4,
      priceLevel: 3,
      visitedOn: '2026-11-24T19:30',
      visitNote: 'Ngon',
      openHours: [{ open: '18:00', close: '02:00' }],
    });
  });

  it.each([
    ['rating', '6'],
    ['rating', '0'],
    ['priceLevel', '4'],
    ['visitedOn', '24/11/2026'],
    ['status', 'gone'],
    ['openHours', 'not-json'],
    ['openHours', JSON.stringify([{ open: '25:00', close: '10:00' }])],
  ])('rejects %s = %s', (key, value) => {
    expect(parse({ name: 'A', status: 'visited', [key]: value }).success).toBe(false);
  });

  it('requires https maps links with a Vietnamese message', () => {
    const bad = parse({ name: 'A', status: 'visited', mapsUrl: 'http://x' });
    expect(bad.success).toBe(false);
    expect(bad.error!.issues[0].message).toBe('Link phải bắt đầu bằng https://');
    const ok = parse({ name: 'A', status: 'visited', mapsUrl: 'https://maps.app.goo.gl/abc' });
    expect(ok.data!.mapsUrl).toBe('https://maps.app.goo.gl/abc');
  });

  it('collects repeated tag ids into arrays and rejects non-uuids', () => {
    const ok = parse({
      name: 'A',
      status: 'visited',
      categoryIds: [U1, U2],
      vibeIds: [U2],
      areaId: U1,
    });
    expect(ok.data).toMatchObject({ categoryIds: [U1, U2], vibeIds: [U2], areaId: U1 });
    expect(parse({ name: 'A', status: 'visited', categoryIds: ['nope'] }).success).toBe(false);
  });

  it('requires a name of at most 100 characters', () => {
    const empty = parse({ name: '   ', status: 'visited' });
    expect(empty.error!.issues[0].message).toBe('Nhập tên quán');
    expect(parse({ name: 'x'.repeat(101), status: 'visited' }).success).toBe(false);
  });
});

describe('visitInput', () => {
  it('parses a visit with Vietnam datetime-local and optional rating/note', () => {
    const r = visitInput.safeParse({
      placeId: U1,
      visitedAt: '2026-11-25T20:00',
      rating: '1',
      note: 'Hôm nay hơi mặn',
    });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({
      placeId: U1,
      visitedAt: '2026-11-25T13:00:00.000Z',
      rating: 1,
      note: 'Hôm nay hơi mặn',
    });
  });

  it('allows blank rating and note', () => {
    const r = visitInput.safeParse({
      placeId: U1,
      visitedAt: '2026-11-25T20:00',
      rating: '',
      note: ' ',
    });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ rating: null, note: null });
  });
});

describe('tagInput', () => {
  it('trims the name and validates icon keys', () => {
    expect(tagInput.parse({ kind: 'vibe', name: ' Ấm cúng ', emoji: '', icon: '' })).toEqual({
      kind: 'vibe',
      name: 'Ấm cúng',
      emoji: null,
      icon: null,
    });
    expect(tagInput.parse({ kind: 'category', name: 'Cà phê', emoji: '', icon: 'coffee' })).toEqual(
      {
        kind: 'category',
        name: 'Cà phê',
        emoji: null,
        icon: 'coffee',
      },
    );
  });

  it('rejects unknown kinds, empty names, and unknown icons', () => {
    expect(tagInput.safeParse({ kind: 'x', name: 'A', emoji: '', icon: '' }).success).toBe(false);
    expect(tagInput.safeParse({ kind: 'area', name: ' ', emoji: '', icon: '' }).success).toBe(
      false,
    );
    expect(
      tagInput.safeParse({ kind: 'category', name: 'X', emoji: '', icon: 'unknown-icon' }).success,
    ).toBe(false);
  });
});
