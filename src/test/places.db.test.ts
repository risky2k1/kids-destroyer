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
  it('anon reads places and tags', async () => {
    const anon = anonClient();
    const { data: tags, error } = await anon.from('plc_tags').select('id');
    expect(error).toBeNull();
    expect(tags!.length).toBeGreaterThanOrEqual(13);
    const { error: pErr } = await anon.from('plc_places').select('id');
    expect(pErr).toBeNull();
  });

  it('anon cannot write', async () => {
    const anon = anonClient();
    const { error } = await anon.from('plc_places').insert({ name: 'X' });
    expect(error).not.toBeNull();
    const { error: tErr } = await anon.from('plc_tags').insert({ kind: 'vibe', name: `A${run}` });
    expect(tErr).not.toBeNull();
  });

  it('user without places.manage cannot write', async () => {
    const { error } = await s.parentA.client.from('plc_places').insert({ name: 'X' });
    expect(error).not.toBeNull();
  });

  it('manager creates a place with tags; deleting a tag keeps the place and drops the link', async () => {
    const { data: place, error } = await manager
      .from('plc_places')
      .insert({ name: `Lẩu ${run}`, rating: 5, price_level: 2 })
      .select('id')
      .single();
    expect(error).toBeNull();
    const { data: lau } = await manager
      .from('plc_tags')
      .select('id')
      .eq('kind', 'category')
      .eq('name', 'Lẩu')
      .single();
    const { data: area, error: aErr } = await manager
      .from('plc_tags')
      .insert({ kind: 'area', name: `Khu ${run}` })
      .select('id')
      .single();
    expect(aErr).toBeNull();
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
