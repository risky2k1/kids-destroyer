import 'server-only';
import { createClient } from '@/core/supabase/server';

export async function listFamilies() {
  const sb = await createClient();
  const { data } = await sb.from('families').select('id, name').order('name');
  return data ?? [];
}

/** Family with its parents and kids. Never selects pin_hash. */
export async function getFamily(id: string) {
  const sb = await createClient();
  const [family, parents, kids, grades] = await Promise.all([
    sb.from('families').select('id, name').eq('id', id).maybeSingle(),
    sb.from('profiles').select('id, display_name').eq('family_id', id).order('display_name'),
    sb
      .from('kids')
      .select('id, display_name, avatar, grade_id, pin_locked_until')
      .eq('family_id', id)
      .order('display_name'),
    sb.from('grades').select('id, name').order('sort'),
  ]);
  if (!family.data) return null;
  return {
    ...family.data,
    parents: parents.data ?? [],
    kids: kids.data ?? [],
    grades: grades.data ?? [],
  };
}

export type FamilyDetail = NonNullable<Awaited<ReturnType<typeof getFamily>>>;

/** Kids visible to the current session (RLS limits a parent to their own family). */
export async function listKidsForFamily(familyId: string) {
  const sb = await createClient();
  const { data } = await sb
    .from('kids')
    .select('id, display_name, avatar')
    .eq('family_id', familyId)
    .order('display_name');
  return data ?? [];
}
