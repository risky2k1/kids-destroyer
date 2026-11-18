import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { inject } from 'vitest';
import type { Database } from '@/core/supabase/database.types';

type Client = SupabaseClient<Database>;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

export const adminClient = (): Client => {
  const { url, serviceKey } = inject('sb');
  return createClient<Database>(url, serviceKey, opts);
};

export const anonClient = (): Client => {
  const { url, anonKey } = inject('sb');
  return createClient<Database>(url, anonKey, opts);
};

export async function signInAs(email: string, password: string): Promise<Client> {
  const c = anonClient();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

const PASSWORD = 'test-password-123';

async function createUser(
  role: 'admin' | 'parent',
  email: string,
  familyId: string | null,
): Promise<string> {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  const id = data.user.id;
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id, role, family_id: familyId, display_name: email.split('@')[0] });
  if (pErr) throw pErr;
  return id;
}

// shortcut: unique suffix per run instead of idempotent upserts; `pnpm exec supabase db reset` clears leftovers.
export async function seedTwoFamilies() {
  const admin = adminClient();
  const run = Math.random().toString(36).slice(2, 8);
  const { data: fams, error } = await admin
    .from('families')
    .insert([{ name: `A-${run}` }, { name: `B-${run}` }])
    .select('id, name');
  if (error) throw error;
  const famA = fams.find((f) => f.name.startsWith('A-'))!.id;
  const famB = fams.find((f) => f.name.startsWith('B-'))!.id;

  const { data: grade } = await admin.from('grades').select('id').eq('name', 'Lớp 2').single();
  const { data: subject } = await admin.from('subjects').select('id').eq('name', 'Toán').single();
  const gradeId = grade!.id;
  const subjectId = subject!.id;

  const emails = {
    admin: `admin-${run}@test.local`,
    parentA: `pa-${run}@test.local`,
    parentB: `pb-${run}@test.local`,
  };
  const adminId = await createUser('admin', emails.admin, null);
  const parentAId = await createUser('parent', emails.parentA, famA);
  const parentBId = await createUser('parent', emails.parentB, famB);

  const { data: kids, error: kErr } = await admin
    .from('kids')
    .insert([
      { family_id: famA, display_name: 'Bé A', avatar: '🐶', grade_id: gradeId, pin_hash: 'x' },
      { family_id: famB, display_name: 'Bé B', avatar: '🐱', grade_id: gradeId, pin_hash: 'x' },
    ])
    .select('id, family_id');
  if (kErr) throw kErr;

  return {
    famA,
    famB,
    gradeId,
    subjectId,
    kidA: kids.find((k) => k.family_id === famA)!.id,
    kidB: kids.find((k) => k.family_id === famB)!.id,
    admin: { id: adminId, client: await signInAs(emails.admin, PASSWORD) },
    parentA: { id: parentAId, client: await signInAs(emails.parentA, PASSWORD) },
    parentB: { id: parentBId, client: await signInAs(emails.parentB, PASSWORD) },
  };
}
