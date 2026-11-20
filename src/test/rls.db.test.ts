import { beforeAll, describe, expect, it } from 'vitest';
import { adminClient, anonClient, seedTwoFamilies } from './db';

let s: Awaited<ReturnType<typeof seedTwoFamilies>>;

beforeAll(async () => {
  s = await seedTwoFamilies();
});

describe('RLS: families are isolated', () => {
  it('parent sees only kids of own family', async () => {
    const { data } = await s.parentA.client.from('kids').select('id');
    expect(data!.map((k) => k.id)).toEqual([s.kidA]);
  });

  it('parent cannot create a kid in another family', async () => {
    const { error } = await s.parentA.client.from('kids').insert({
      family_id: s.famB,
      display_name: 'x',
      avatar: '🐶',
      grade_id: s.gradeId,
      pin_hash: 'x',
    });
    expect(error).not.toBeNull();
  });

  it('parent cannot see assignments of another family kid', async () => {
    const { data: quiz } = await s.parentB.client
      .from('quizzes')
      .insert({ title: 'Q', subject_id: s.subjectId, grade_id: s.gradeId })
      .select('id')
      .single();
    const { error } = await s.parentB.client
      .from('assignments')
      .insert({ quiz_id: quiz!.id, kid_id: s.kidB });
    expect(error).toBeNull();

    const { data } = await s.parentA.client.from('assignments').select('id').eq('kid_id', s.kidB);
    expect(data).toEqual([]);
  });

  it('admin sees kids of all families', async () => {
    const { data } = await s.admin.client.from('kids').select('id');
    const ids = data!.map((k) => k.id);
    expect(ids).toContain(s.kidA);
    expect(ids).toContain(s.kidB);
  });
});

describe('RLS: no privilege escalation', () => {
  it('parent cannot promote self to admin', async () => {
    const { data } = await s.parentA.client
      .from('profiles')
      .update({ role_id: 'super_admin' })
      .eq('id', s.parentA.id)
      .select('id');
    expect(data ?? []).toEqual([]);
    const { data: me } = await adminClient()
      .from('profiles')
      .select('role_id')
      .eq('id', s.parentA.id)
      .single();
    expect(me!.role_id).toBe('parent');
  });

  it('parent cannot move self to another family', async () => {
    const { data } = await s.parentA.client
      .from('profiles')
      .update({ family_id: s.famB })
      .eq('id', s.parentA.id)
      .select('id');
    expect(data ?? []).toEqual([]);
  });

  it('parent cannot write catalog but can read it', async () => {
    const { error } = await s.parentA.client.from('subjects').insert({ name: 'Hack', sort: 9 });
    expect(error).not.toBeNull();
    const { data } = await s.parentA.client.from('subjects').select('id');
    expect(data!.length).toBeGreaterThanOrEqual(2);
  });
});

describe('RLS: shared question bank', () => {
  it('parent sees but cannot edit another parent question', async () => {
    const { data: q } = await s.parentB.client
      .from('questions')
      .insert({ type: 'mcq', subject_id: s.subjectId, grade_id: s.gradeId, prompt: '1+1?' })
      .select('id')
      .single();

    const { data: seen } = await s.parentA.client.from('questions').select('id').eq('id', q!.id);
    expect(seen).toHaveLength(1);

    const { data: updated } = await s.parentA.client
      .from('questions')
      .update({ prompt: 'hacked' })
      .eq('id', q!.id)
      .select('id');
    expect(updated ?? []).toEqual([]);
  });

  it('anon sees no questions', async () => {
    const { data } = await anonClient().from('questions').select('id');
    expect(data ?? []).toEqual([]);
  });
});

describe('FK restrict', () => {
  it('admin cannot delete a grade in use', async () => {
    const { error } = await s.admin.client.from('grades').delete().eq('id', s.gradeId);
    expect(error?.code).toBe('23503');
  });
});

describe('Storage: voice bucket is per family', () => {
  const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' });

  it('parent uploads under own family folder, other family cannot read it', async () => {
    const path = `${s.famA}/${s.kidA}/${crypto.randomUUID()}.webm`;
    const up = await s.parentA.client.storage.from('voice').upload(path, audio());
    expect(up.error).toBeNull();
    const own = await s.parentA.client.storage.from('voice').createSignedUrl(path, 60);
    expect(own.error).toBeNull();
    const other = await s.parentB.client.storage.from('voice').createSignedUrl(path, 60);
    expect(other.data).toBeNull();
    const admin = await s.admin.client.storage.from('voice').createSignedUrl(path, 60);
    expect(admin.error).toBeNull();
  });

  it('parent cannot upload into another family folder', async () => {
    const path = `${s.famB}/${s.kidB}/${crypto.randomUUID()}.webm`;
    const { error } = await s.parentA.client.storage.from('voice').upload(path, audio());
    expect(error).not.toBeNull();
  });
});
