import { beforeAll, describe, expect, it } from 'vitest';
import { adminClient, seedTwoFamilies, signInAs } from './db';

const PASSWORD = 'test-password-123';
let s: Awaited<ReturnType<typeof seedTwoFamilies>>;
const run = Math.random().toString(36).slice(2, 8);
const role = (name: string) => `${name}_${run}`;

/** A staff account (no family) with the given role, created through the service role. */
async function staff(roleId: string) {
  const admin = adminClient();
  const email = `${roleId}@test.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role_id: roleId, display_name: roleId });
  if (pErr) throw pErr;
  return { id: data.user.id, client: await signInAs(email, PASSWORD) };
}

async function makeRole(id: string, permissions: string[]) {
  const sa = s.admin.client;
  const { error } = await sa.from('roles').insert({ id, name: id });
  if (error) throw error;
  if (permissions.length) {
    const { error: pErr } = await sa
      .from('role_permissions')
      .insert(permissions.map((permission) => ({ role_id: id, permission })));
    if (pErr) throw pErr;
  }
}

let editor: Awaited<ReturnType<typeof staff>>;
let manager: Awaited<ReturnType<typeof staff>>;
let familyStaff: Awaited<ReturnType<typeof staff>>;

beforeAll(async () => {
  s = await seedTwoFamilies();
  await makeRole(role('editor'), ['admin.access', 'catalog.manage']);
  await makeRole(role('manager'), ['admin.access', 'access.manage', 'catalog.manage']);
  await makeRole(role('family'), ['admin.access', 'families.manage']);
  editor = await staff(role('editor'));
  manager = await staff(role('manager'));
  familyStaff = await staff(role('family'));
});

describe('RBAC: permissions gate writes', () => {
  it('catalog.manage can write the catalog', async () => {
    const { error } = await editor.client.from('topics').insert({
      name: `T-${run}`,
      subject_id: s.subjectId,
      grade_id: s.gradeId,
    });
    expect(error).toBeNull();
  });

  it('without settings.manage settings stay read-only', async () => {
    const { data } = await editor.client
      .from('settings')
      .update({ value: 'x' })
      .eq('key', 'site_name')
      .select('key');
    expect(data ?? []).toEqual([]);
  });

  it('without families.manage other families stay hidden', async () => {
    const { data } = await editor.client.from('kids').select('id');
    expect(data ?? []).toEqual([]);
  });
});

describe('RBAC: no privilege escalation', () => {
  it('parent cannot create roles or grant permissions', async () => {
    const { error } = await s.parentA.client.from('roles').insert({ id: role('x'), name: 'x' });
    expect(error).not.toBeNull();
    const { error: gErr } = await s.parentA.client
      .from('role_permissions')
      .insert({ role_id: 'parent', permission: 'admin.access' });
    expect(gErr).not.toBeNull();
  });

  it('access.manage can grant only permissions it holds', async () => {
    const own = await manager.client
      .from('role_permissions')
      .insert({ role_id: role('editor'), permission: 'access.manage' });
    expect(own.error).toBeNull();
    const foreign = await manager.client
      .from('role_permissions')
      .insert({ role_id: role('editor'), permission: 'settings.manage' });
    expect(foreign.error).not.toBeNull();
  });

  it('access.manage cannot hand out super_admin or a stronger role', async () => {
    const toSuper = await manager.client
      .from('profiles')
      .update({ role_id: 'super_admin' })
      .eq('id', manager.id);
    expect(toSuper.error?.code).toBe('42501');
    const toAdmin = await manager.client
      .from('profiles')
      .update({ role_id: 'admin' })
      .eq('id', editor.id);
    expect(toAdmin.error?.code).toBe('42501');
  });

  it('families.manage alone cannot change roles', async () => {
    const { error } = await familyStaff.client
      .from('profiles')
      .update({ role_id: role('family') })
      .eq('id', editor.id);
    expect(error?.code).toBe('42501');
  });

  it('system roles cannot be deleted and super_admin permissions are never stored', async () => {
    const { data } = await s.admin.client.from('roles').delete().eq('id', 'parent').select('id');
    expect(data ?? []).toEqual([]);
    const { error } = await s.admin.client
      .from('role_permissions')
      .insert({ role_id: 'super_admin', permission: 'catalog.manage' });
    expect(error).not.toBeNull();
  });

  it('a role in use cannot be deleted', async () => {
    const { error } = await s.admin.client.from('roles').delete().eq('id', role('editor'));
    expect(error?.code).toBe('23503');
  });
});
