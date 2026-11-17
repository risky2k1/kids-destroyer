import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PATHS } from '@/core/routes';
import type { Database } from '@/core/supabase/database.types';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/core/supabase/env';

const PROTECTED = [PATHS.admin.root, PATHS.parent.root, PATHS.kid.root];
const isUnder = (path: string, root: string) => path === root || path.startsWith(root + '/');

// Refreshes the Supabase session and does optimistic redirects. Real checks live in layouts/actions + RLS.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((root) => isUnder(path, root))) {
    return NextResponse.redirect(new URL(PATHS.login, request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
