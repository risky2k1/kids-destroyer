import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { can, canEnter, type Area, type Principal } from '@/core/acl/access';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';

export type CurrentUser = Principal & {
  id: string;
  email: string;
  roleName: string;
  displayName: string;
};

export const homeFor = (user: Principal) =>
  canEnter('admin', user) ? PATHS.admin.root : PATHS.parent.root;

/** Verified against the Auth server (getUser), memoized per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id, family_id, display_name, roles(name, role_permissions(permission))')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    roleId: profile.role_id,
    roleName: profile.roles?.name ?? profile.role_id,
    permissions: profile.roles?.role_permissions.map((r) => r.permission) ?? [],
    familyId: profile.family_id,
    displayName: profile.display_name,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(PATHS.login);
  return user;
}

/** Guard for layouts and server actions. Wrong area → user's own home. */
export async function requireArea(area: Area): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(PATHS.login);
  if (!canEnter(area, user)) redirect(homeFor(user));
  return user;
}

export async function requirePermission(permission: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(PATHS.login);
  if (!can(user, permission)) redirect(homeFor(user));
  return user;
}
