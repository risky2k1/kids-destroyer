import { beforeAll, describe, expect, it } from 'vitest';
import { adminClient, anonClient, seedTwoFamilies, signInAs } from './db';

const PASSWORD = 'test-password-123';
const run = Math.random().toString(36).slice(2, 8);
const ROLE = `manager_${run}`;
let s: Awaited<ReturnType<typeof seedTwoFamilies>>;
let manager: Awaited<ReturnType<typeof signInAs>>;

beforeAll(async () => {
  s = await seedTwoFamilies();
  const { error } = await s.admin.client.from('roles').insert({ id: ROLE, name: ROLE });
  if (error) throw error;
  const { error: rpErr } = await s.admin.client
    .from('role_permissions')
    .insert({ role_id: ROLE, permission: 'places.manage' });
  if (rpErr) throw rpErr;
  const admin = adminClient();
  const email = `mgr-${run}@test.local`;
  const { data, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (uErr) throw uErr;
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role_id: ROLE, display_name: 'mgr' });
  if (pErr) throw pErr;
  manager = await signInAs(email, PASSWORD);
});

describe('RLS: places', () => {
  it('anon reads places, tags, and visits', async () => {
    const anon = anonClient();
    const { data: tags, error } = await anon.from('plc_tags').select('id');
    expect(error).toBeNull();
    expect(tags!.length).toBeGreaterThanOrEqual(13);
    const { error: pErr } = await anon.from('plc_places').select('id');
    expect(pErr).toBeNull();
    const { error: vErr } = await anon.from('plc_visits').select('id');
    expect(vErr).toBeNull();
  });

  it('anon cannot write', async () => {
    const anon = anonClient();
    const { error } = await anon.from('plc_places').insert({ name: 'X' });
    expect(error).not.toBeNull();
    const { error: tErr } = await anon.from('plc_tags').insert({ kind: 'vibe', name: `A${run}` });
    expect(tErr).not.toBeNull();
  });

  it('user without places.manage cannot write places or visits', async () => {
    const { error } = await s.parentA.client.from('plc_places').insert({ name: 'X' });
    expect(error).not.toBeNull();
    const { data: place } = await manager
      .from('plc_places')
      .insert({ name: `Guard ${run}` })
      .select('id')
      .single();
    const { error: vErr } = await s.parentA.client
      .from('plc_visits')
      .insert({ place_id: place!.id, rating: 5 });
    expect(vErr).not.toBeNull();
  });

  it('manager creates a place with tags and icon; deleting a tag keeps the place and drops the link', async () => {
    const { data: place, error } = await manager
      .from('plc_places')
      .insert({
        name: `Lẩu ${run}`,
        rating: 5,
        price_level: 2,
        open_hours: [{ open: '18:00', close: '02:00' }],
      })
      .select('id, open_hours')
      .single();
    expect(error).toBeNull();
    expect(place!.open_hours).toEqual([{ open: '18:00', close: '02:00' }]);

    const { data: lau } = await manager
      .from('plc_tags')
      .select('id')
      .eq('kind', 'category')
      .eq('name', 'Lẩu')
      .single();
    const { data: area, error: aErr } = await manager
      .from('plc_tags')
      .insert({ kind: 'area', name: `Khu ${run}`, icon: 'map-pin' })
      .select('id, icon')
      .single();
    expect(aErr).toBeNull();
    expect(area!.icon).toBe('map-pin');

    const { error: lErr } = await manager.from('plc_place_tags').insert([
      { place_id: place!.id, tag_id: lau!.id },
      { place_id: place!.id, tag_id: area!.id },
    ]);
    expect(lErr).toBeNull();

    const { error: dErr } = await manager.from('plc_tags').delete().eq('id', area!.id);
    expect(dErr).toBeNull();
    const { data: still } = await anonClient().from('plc_places').select('id').eq('id', place!.id);
    expect(still).toHaveLength(1);
    const { data: links } = await anonClient()
      .from('plc_place_tags')
      .select('tag_id')
      .eq('place_id', place!.id);
    expect(links).toEqual([{ tag_id: lau!.id }]);
  });

  it('syncs place average rating and visited_on from plc_visits trigger', async () => {
    const { data: place, error: pErr } = await manager
      .from('plc_places')
      .insert({ name: `VisitAvg ${run}`, status: 'visited' })
      .select('id')
      .single();
    expect(pErr).toBeNull();

    const { data: v1, error: v1Err } = await manager
      .from('plc_visits')
      .insert({
        place_id: place!.id,
        visited_at: '2026-11-20T12:00:00Z',
        rating: 5,
        note: 'Lần 1 rất ngon',
      })
      .select('id')
      .single();
    expect(v1Err).toBeNull();

    const { data: v2, error: v2Err } = await manager
      .from('plc_visits')
      .insert({
        place_id: place!.id,
        visited_at: '2026-11-24T18:00:00Z', // 2026-11-25 01:00 in Vietnam
        rating: 1,
        note: 'Lần 2 phục vụ chậm',
      })
      .select('id')
      .single();
    expect(v2Err).toBeNull();

    const { data: afterTwo } = await anonClient()
      .from('plc_places')
      .select('rating, visited_on')
      .eq('id', place!.id)
      .single();
    expect(Number(afterTwo!.rating)).toBe(3);
    expect(afterTwo!.visited_on).toBe('2026-11-25');

    // Add a 4-star visit: (5 + 1 + 4) / 3 = 3.33
    const { error: v3Err } = await manager.from('plc_visits').insert({
      place_id: place!.id,
      visited_at: '2026-11-21T05:00:00Z',
      rating: 4,
    });
    expect(v3Err).toBeNull();

    const { data: afterThree } = await anonClient()
      .from('plc_places')
      .select('rating')
      .eq('id', place!.id)
      .single();
    expect(Number(afterThree!.rating)).toBe(3.33);

    // Delete the 1-star visit: (5 + 4) / 2 = 4.5
    const { error: delErr } = await manager.from('plc_visits').delete().eq('id', v2!.id);
    expect(delErr).toBeNull();
    const { data: afterDelete } = await anonClient()
      .from('plc_places')
      .select('rating, visited_on')
      .eq('id', place!.id)
      .single();
    expect(Number(afterDelete!.rating)).toBe(4.5);
    expect(afterDelete!.visited_on).toBe('2026-11-21');
    expect(v1!.id).toBeTruthy();
  });

  it('duplicate tag name in same kind is rejected (case-insensitive)', async () => {
    const { error } = await manager.from('plc_tags').insert({ kind: 'vibe', name: 'hiện đại' });
    expect(error?.code).toBe('23505');
  });

  it('rating out of range is rejected', async () => {
    const { error } = await manager.from('plc_places').insert({ name: 'Bad', rating: 6 });
    expect(error).not.toBeNull();
  });

  it('anon can read modules', async () => {
    const { error } = await anonClient().from('modules').select('id');
    expect(error).toBeNull();
  });

  it('anon cannot read a pending place', async () => {
    const { data: place, error } = await manager
      .from('plc_places')
      .insert({ name: `Pending ${run}` })
      .select('id')
      .single();
    expect(error).toBeNull();
    const { error: uErr } = await adminClient()
      .from('plc_places')
      .update({ review_status: 'pending', origin: 'community' })
      .eq('id', place!.id);
    expect(uErr).toBeNull();

    const { data: hidden, error: aErr } = await anonClient()
      .from('plc_places')
      .select('id')
      .eq('id', place!.id);
    expect(aErr).toBeNull();
    expect(hidden).toEqual([]);

    const { data: seen, error: mErr } = await manager
      .from('plc_places')
      .select('id')
      .eq('id', place!.id);
    expect(mErr).toBeNull();
    expect(seen).toHaveLength(1);
  });

  it('anon cannot publish or claim an admin place', async () => {
    const anon = anonClient();
    const { error: claimed } = await anon.from('plc_places').insert({
      name: `Claim ${run}`,
      origin: 'admin',
      review_status: 'pending',
      status: 'wishlist',
    });
    expect(claimed).not.toBeNull();

    const { error: published } = await anon.from('plc_places').insert({
      name: `Publish ${run}`,
      origin: 'community',
      review_status: 'approved',
      status: 'wishlist',
    });
    expect(published).not.toBeNull();

    const { error: priced } = await anon.from('plc_places').insert({
      name: `Priced ${run}`,
      origin: 'community',
      review_status: 'pending',
      status: 'wishlist',
      price_level: 1,
    });
    expect(priced).not.toBeNull();

    const name = `Suggest ${run}`;
    const { error: ok } = await anon.from('plc_places').insert({
      name,
      origin: 'community',
      review_status: 'pending',
      status: 'wishlist',
    });
    expect(ok).toBeNull();

    const { data: saved } = await manager
      .from('plc_places')
      .select('origin, review_status, status, rating, price_level, dishes, visited_on, photos')
      .eq('name', name)
      .single();
    expect(saved).toEqual({
      origin: 'community',
      review_status: 'pending',
      status: 'wishlist',
      rating: null,
      price_level: null,
      dishes: null,
      visited_on: null,
      photos: [],
    });
  });

  it('anon cannot link an area tag', async () => {
    const anon = anonClient();
    const name = `Tagged ${run}`;
    const { error: pErr } = await anon.from('plc_places').insert({
      name,
      origin: 'community',
      review_status: 'pending',
      status: 'wishlist',
    });
    expect(pErr).toBeNull();
    const { data: pending } = await manager
      .from('plc_places')
      .select('id')
      .eq('name', name)
      .single();

    const { data: category } = await manager
      .from('plc_tags')
      .select('id')
      .eq('kind', 'category')
      .limit(1)
      .single();
    const { data: area, error: aErr } = await manager
      .from('plc_tags')
      .insert({ kind: 'area', name: `Area ${run}` })
      .select('id')
      .single();
    expect(aErr).toBeNull();

    const { error: catErr } = await anon
      .from('plc_place_tags')
      .insert({ place_id: pending!.id, tag_id: category!.id });
    expect(catErr).toBeNull();

    const { error: areaErr } = await anon
      .from('plc_place_tags')
      .insert({ place_id: pending!.id, tag_id: area!.id });
    expect(areaErr).not.toBeNull();

    const { data: approved, error: apErr } = await manager
      .from('plc_places')
      .insert({ name: `Approved ${run}` })
      .select('id')
      .single();
    expect(apErr).toBeNull();
    const { error: approvedLink } = await anon
      .from('plc_place_tags')
      .insert({ place_id: approved!.id, tag_id: category!.id });
    expect(approvedLink).not.toBeNull();
  });

  it('anon cannot update a pending place', async () => {
    const anon = anonClient();
    const name = `Locked ${run}`;
    const { error: insErr } = await anon.from('plc_places').insert({
      name,
      origin: 'community',
      review_status: 'pending',
      status: 'wishlist',
    });
    expect(insErr).toBeNull();
    const { data: row } = await manager.from('plc_places').select('id').eq('name', name).single();

    const { data: approved, error: approveErr } = await anon
      .from('plc_places')
      .update({ review_status: 'approved' })
      .eq('id', row!.id)
      .select('id')
      .single();
    expect(approveErr).not.toBeNull();
    expect(approved).toBeNull();

    const { data: renamed, error: nameErr } = await anon
      .from('plc_places')
      .update({ name: `Hacked ${run}` })
      .eq('id', row!.id)
      .select('id')
      .single();
    expect(nameErr).not.toBeNull();
    expect(renamed).toBeNull();

    const { data: still } = await manager
      .from('plc_places')
      .select('name, review_status')
      .eq('id', row!.id)
      .single();
    expect(still).toEqual({ name, review_status: 'pending' });
  });

  it('anon cannot upload to the places bucket', async () => {
    const { error } = await anonClient()
      .storage.from('places')
      .upload(`anon-${run}.png`, new Blob(['x'], { type: 'image/png' }), {
        contentType: 'image/png',
      });
    expect(error).not.toBeNull();
  });

  it('manager can upload and remove a photo', async () => {
    const path = `test-${run}/a.png`;
    const { error } = await manager.storage
      .from('places')
      .upload(path, new Blob(['x'], { type: 'image/png' }), { contentType: 'image/png' });
    expect(error).toBeNull();
    const { data, error: rmErr } = await manager.storage.from('places').remove([path]);
    expect(rmErr).toBeNull();
    expect(data).toHaveLength(1);
  });
});
