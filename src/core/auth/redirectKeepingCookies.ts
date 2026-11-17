import { NextResponse } from 'next/server';

/** Redirect without losing cookies (e.g. a just-rotated Supabase session) set on `from`. */
export function redirectKeepingCookies(from: NextResponse, url: string | URL): NextResponse {
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}
