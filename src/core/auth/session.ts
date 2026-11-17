import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { canEnter, type Area, type Role } from '@/core/acl/access';
import { PATHS } from '@/core/routes';
import { createClient } from '@/core/supabase/server';

export type { Role };
export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  familyId: string | null;
  displayName: string;
};

export const homeFor = (role: Role) => (role === 'admin' ? PATHS.admin.root : PATHS.parent.root);

/** Verified against the Auth server (getUser), memoized per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, family_id, display_name')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    role: profile.role,
    familyId: profile.family_id,
    displayName: profile.display_name,
  };
});

/** Guard for layouts and server actions. Wrong area → user's own home. */
export async function requireArea(area: Area): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(PATHS.login);
  if (!canEnter(area, user)) redirect(homeFor(user.role));
  return user;
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(PATHS.login);
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
