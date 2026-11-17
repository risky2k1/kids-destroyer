import { createBrowserClient as create } from '@supabase/ssr';
import type { Database } from './database.types';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

export const createBrowserClient = () => create<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
