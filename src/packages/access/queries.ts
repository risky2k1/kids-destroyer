import 'server-only';
import { createClient } from '@/core/supabase/server';

export type RoleSummary = {
  id: string;
  name: string;
  isSystem: boolean;
  permissionCount: number;
  accountCount: number;
};

export type RoleDetail = {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
};

export type AccountSummary = {
  id: string;
  displayName: string;
  roleId: string;
  familyName: string | null;
};

type CountRel = { count: number }[] | null;
type FamilyRel = { name: string } | { name: string }[] | null;

const oneFamilyName = (f: FamilyRel): string | null => {
  if (!f) return null;
  if (Array.isArray(f)) return f[0]?.name ?? null;
  return f.name ?? null;
};

export async function listRoles(): Promise<RoleSummary[]> {
  const sb = await createClient();
  const { data } = await sb
    .from('roles')
    .select('id, name, is_system, role_permissions(count), profiles(count)')
    .order('created_at');

  type RoleRow = {
    id: string;
    name: string;
    is_system: boolean;
    role_permissions: CountRel;
    profiles: CountRel;
  };

  return ((data ?? []) as unknown as RoleRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    isSystem: row.is_system,
    permissionCount: row.role_permissions?.[0]?.count ?? 0,
    accountCount: row.profiles?.[0]?.count ?? 0,
  }));
}

export async function getRole(id: string): Promise<RoleDetail | null> {
  const sb = await createClient();
  const { data } = await sb
    .from('roles')
    .select('id, name, is_system, role_permissions(permission)')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  type DetailRow = {
    id: string;
    name: string;
    is_system: boolean;
    role_permissions: { permission: string }[] | null;
  };

  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    name: row.name,
    isSystem: row.is_system,
    permissions: (row.role_permissions ?? []).map((rp) => rp.permission),
  };
}

export async function listAccounts(): Promise<{
  accounts: AccountSummary[];
  roles: RoleSummary[];
}> {
  const sb = await createClient();
  const [profilesRes, roles] = await Promise.all([
    sb.from('profiles').select('id, display_name, role_id, families(name)').order('display_name'),
    listRoles(),
  ]);

  type ProfileRow = {
    id: string;
    display_name: string;
    role_id: string;
    families: FamilyRel;
  };

  const accounts = ((profilesRes.data ?? []) as unknown as ProfileRow[]).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    roleId: row.role_id,
    familyName: oneFamilyName(row.families),
  }));

  return { accounts, roles };
}
