import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { SUPABASE_URL } from './env';

/** Service-role client: bypasses RLS. Only for admin-only operations such as creating auth users. */
export const createAdminClient = () =>
  createClient<Database>(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
