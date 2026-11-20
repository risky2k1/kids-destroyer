import { beforeAll, describe, expect, it } from 'vitest';
import { adminClient, seedTwoFamilies, signInAs } from './db';

const PASSWORD = 'test-password-123';
const run = Math.random().toString(36).slice(2, 8);
const ROLE = `player_${run}`;
let s: Awaited<ReturnType<typeof seedTwoFamilies>>;

async function player(name: string) {
  const admin = adminClient();
  const email = `${name}-${run}@test.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role_id: ROLE, display_name: name });
  if (pErr) throw pErr;
  return { id: data.user.id, client: await signInAs(email, PASSWORD) };
}

let p1: Awaited<ReturnType<typeof player>>;
let p2: Awaited<ReturnType<typeof player>>;
let p1Server: string;
let p1Char: string;

beforeAll(async () => {
  s = await seedTwoFamilies();
  const { error } = await s.admin.client.from('roles').insert({ id: ROLE, name: ROLE });
  if (error) throw error;
  await s.admin.client.from('role_permissions').insert({ role_id: ROLE, permission: 'sxs.use' });
  p1 = await player('p1');
  p2 = await player('p2');
  const { data: srv, error: sErr } = await p1.client
    .from('sxs_servers')
    .insert({ name: 'S1', opened_on: '2026-11-01' })
    .select('id')
    .single();
  if (sErr) throw sErr;
  p1Server = srv.id;
  const { data: ch, error: cErr } = await p1.client
    .from('sxs_characters')
    .insert({ name: 'Hero', server_id: p1Server, data: { character: {} } })
    .select('id')
    .single();
  if (cErr) throw cErr;
  p1Char = ch.id;
});

describe('RLS: sword-x-staff', () => {
  it('owner reads own character', async () => {
    const { data } = await p1.client.from('sxs_characters').select('id');
    expect(data!.map((c) => c.id)).toEqual([p1Char]);
  });

  it("another player sees nothing of p1's data", async () => {
    const { data: chars } = await p2.client.from('sxs_characters').select('id');
    const { data: servers } = await p2.client.from('sxs_servers').select('id');
    expect(chars ?? []).toEqual([]);
    expect(servers ?? []).toEqual([]);
  });

  it("cannot attach a character to someone else's server", async () => {
    const { error } = await p2.client
      .from('sxs_characters')
      .insert({ name: 'Thief', server_id: p1Server, data: {} });
    expect(error).not.toBeNull();
  });

  it('without sxs.use a user (parent) can neither read nor write', async () => {
    const { data } = await s.parentA.client.from('sxs_characters').select('id');
    expect(data ?? []).toEqual([]);
    const { error } = await s.parentA.client
      .from('sxs_servers')
      .insert({ name: 'X', opened_on: '2026-11-01' });
    expect(error).not.toBeNull();
  });

  it('rejects a non-object document', async () => {
    const { error } = await p1.client
      .from('sxs_characters')
      .update({ data: [1, 2, 3] })
      .eq('id', p1Char);
    expect(error).not.toBeNull();
  });
});
