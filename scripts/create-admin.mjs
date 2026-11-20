// Creates an admin account (auth user + profile).
// Usage: node --env-file=<env file> scripts/create-admin.mjs --email a@b.vn --password '...' --name 'Admin'
// The env file decides the target: .env.development.local = local stack, .env.local = real project.
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const { values } = parseArgs({
  options: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } },
});
const { email, password, name = 'Admin' } = values;
if (!email || !password || password.length < 8) {
  console.error('Need --email and --password (8+ chars)');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use --env-file)');
  process.exit(1);
}
console.log(`Target: ${url}`);

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  console.error('Create user failed:', error.message);
  process.exit(1);
}
const { error: pErr } = await sb
  .from('profiles')
  .insert({ id: data.user.id, role_id: 'super_admin', family_id: null, display_name: name });
if (pErr) {
  await sb.auth.admin.deleteUser(data.user.id); // no orphan auth user
  console.error('Create profile failed:', pErr.message);
  process.exit(1);
}
console.log(`Admin created: ${email}`);
