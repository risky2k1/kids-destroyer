import 'server-only';
import { canEnter } from '@/core/acl/access';
import { readKidCookie } from '@/core/auth/kidCookie';
import { getCurrentUser } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';

export type CurrentKid = {
  id: string;
  displayName: string;
  avatar: string;
  gradeId: string;
  familyId: string;
};

/** The kid in kid mode, only if the cookie is valid AND the kid belongs to the signed-in parent's family. */
export async function getCurrentKid(): Promise<CurrentKid | null> {
  const kidId = await readKidCookie();
  if (!kidId) return null;
  const user = await getCurrentUser();
  if (!user || !canEnter('kid', user)) return null;
  const sb = await createClient(); // parent session → RLS limits to own family
  const { data } = await sb
    .from('kids')
    .select('id, display_name, avatar, grade_id, family_id')
    .eq('id', kidId)
    .maybeSingle();
  if (!data || data.family_id !== user.familyId) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    avatar: data.avatar,
    gradeId: data.grade_id,
    familyId: data.family_id,
  };
}
