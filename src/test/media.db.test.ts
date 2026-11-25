import { beforeAll, describe, expect, it } from 'vitest';
import { adminClient, anonClient, seedTwoFamilies, signInAs } from './db';

const PASSWORD = 'test-password-123';
const run = Math.random().toString(36).slice(2, 8);
const VIEW_ROLE = `media_viewer_${run}`;
const MANAGE_ROLE = `media_mgr_${run}`;
let s: Awaited<ReturnType<typeof seedTwoFamilies>>;
let viewer: Awaited<ReturnType<typeof signInAs>>;
let manager: Awaited<ReturnType<typeof signInAs>>;

async function createUserWithPermission(permission: string, roleId: string, prefix: string) {
  const admin = adminClient();
  const { error: rErr } = await admin.from('roles').insert({ id: roleId, name: roleId });
  if (rErr) throw rErr;
  const { error: rpErr } = await admin
    .from('role_permissions')
    .insert({ role_id: roleId, permission });
  if (rpErr) throw rpErr;
  const email = `${prefix}-${run}@test.local`;
  const { data, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (uErr) throw uErr;
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role_id: roleId, display_name: prefix });
  if (pErr) throw pErr;
  return signInAs(email, PASSWORD);
}

beforeAll(async () => {
  s = await seedTwoFamilies();
  viewer = await createUserWithPermission('media.view', VIEW_ROLE, 'mview');
  manager = await createUserWithPermission('media.manage', MANAGE_ROLE, 'mmgr');
});

describe('RLS & constraints: media', () => {
  it('enforces public/private tree isolation and restrict delete on folders', async () => {
    const { data: pubFolder, error: pfErr } = await manager
      .from('media_folders')
      .insert({ name: `Public ${run}`, visibility: 'public' })
      .select('id, visibility')
      .single();
    expect(pfErr).toBeNull();

    const { data: privFolder, error: prfErr } = await manager
      .from('media_folders')
      .insert({ name: `Private ${run}`, visibility: 'private' })
      .select('id, visibility')
      .single();
    expect(prfErr).toBeNull();

    const { error: crossSubErr } = await manager.from('media_folders').insert({
      name: `Cross ${run}`,
      parent_id: pubFolder!.id,
      visibility: 'private',
    });
    expect(crossSubErr).not.toBeNull();

    const { data: pubFile, error: pFileErr } = await manager
      .from('media_files')
      .insert({
        folder_id: pubFolder!.id,
        visibility: 'public',
        driver: 'supabase',
        storage_key: `2026/11/pub-${run}.webp`,
        name: 'hero.webp',
        mime_type: 'image/webp',
        size_bytes: 1200,
      })
      .select('id')
      .single();
    expect(pFileErr).toBeNull();

    const { error: crossFileErr } = await manager.from('media_files').insert({
      folder_id: privFolder!.id,
      visibility: 'public',
      driver: 'supabase',
      storage_key: `2026/11/cross-${run}.webp`,
      name: 'bad.webp',
      mime_type: 'image/webp',
      size_bytes: 100,
    });
    expect(crossFileErr).not.toBeNull();

    const { error: delNonEmptyErr } = await manager
      .from('media_folders')
      .delete()
      .eq('id', pubFolder!.id);
    expect(delNonEmptyErr).not.toBeNull();
    expect(delNonEmptyErr!.code).toBe('23503');

    await manager.from('media_files').delete().eq('id', pubFile!.id);
    const { error: delEmptyErr } = await manager
      .from('media_folders')
      .delete()
      .eq('id', pubFolder!.id);
    expect(delEmptyErr).toBeNull();
    await manager.from('media_folders').delete().eq('id', privFolder!.id);
  });

  it('allows anon to read only public media_files and never private files or folders', async () => {
    const pubKey = `2026/11/anon-pub-${run}.png`;
    const privKey = `2026/11/anon-priv-${run}.pdf`;

    const { data: pubRow } = await manager
      .from('media_files')
      .insert({
        visibility: 'public',
        driver: 'supabase',
        storage_key: pubKey,
        name: 'public.png',
        mime_type: 'image/png',
        size_bytes: 512,
      })
      .select('id')
      .single();

    const { data: privRow } = await manager
      .from('media_files')
      .insert({
        visibility: 'private',
        driver: 'supabase',
        storage_key: privKey,
        name: 'secret.pdf',
        mime_type: 'application/pdf',
        size_bytes: 2048,
      })
      .select('id')
      .single();

    const anon = anonClient();
    const { data: anonFiles, error: afErr } = await anon
      .from('media_files')
      .select('id, visibility')
      .in('id', [pubRow!.id, privRow!.id]);
    expect(afErr).toBeNull();
    expect(anonFiles).toHaveLength(1);
    expect(anonFiles![0].id).toBe(pubRow!.id);

    const { data: anonFolders } = await anon.from('media_folders').select('id');
    expect(anonFolders).toEqual([]);

    const { data: viewerFiles } = await viewer
      .from('media_files')
      .select('id')
      .in('id', [pubRow!.id, privRow!.id]);
    expect(viewerFiles).toHaveLength(2);

    const { error: viewerInsertErr } = await viewer.from('media_files').insert({
      visibility: 'public',
      driver: 'supabase',
      storage_key: `2026/11/denied-${run}.png`,
      name: 'denied.png',
      mime_type: 'image/png',
      size_bytes: 100,
    });
    expect(viewerInsertErr).not.toBeNull();

    const { data: parentPrivRows, error: parentPrivErr } = await s.parentA.client
      .from('media_files')
      .select('id')
      .eq('id', privRow!.id);
    expect(parentPrivErr).toBeNull();
    expect(parentPrivRows).toEqual([]);

    await manager.from('media_files').delete().in('id', [pubRow!.id, privRow!.id]);
  });

  it('enforces media-public and media-private storage policies', async () => {
    const pubPath = `2026/11/st-pub-${run}.png`;
    const privPath = `2026/11/st-priv-${run}.pdf`;

    const { error: viewerUpErr } = await viewer.storage
      .from('media-public')
      .upload(pubPath, new Blob(['x'], { type: 'image/png' }), { contentType: 'image/png' });
    expect(viewerUpErr).not.toBeNull();

    const { error: mgrPubErr } = await manager.storage
      .from('media-public')
      .upload(pubPath, new Blob(['x'], { type: 'image/png' }), { contentType: 'image/png' });
    expect(mgrPubErr).toBeNull();

    const { error: mgrPrivErr } = await manager.storage
      .from('media-private')
      .upload(privPath, new Blob(['pdf'], { type: 'application/pdf' }), {
        contentType: 'application/pdf',
      });
    expect(mgrPrivErr).toBeNull();

    const { data: viewerSigned, error: signErr } = await viewer.storage
      .from('media-private')
      .createSignedUrl(privPath, 60);
    expect(signErr).toBeNull();
    expect(viewerSigned?.signedUrl).toBeTruthy();

    await manager.storage.from('media-public').remove([pubPath]);
    await manager.storage.from('media-private').remove([privPath]);
  });
});
