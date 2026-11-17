import { NextResponse, type NextRequest } from 'next/server';
import { clearKidCookie } from '@/core/auth/kidCookie';
import { PATHS } from '@/core/routes';

/** Invalid kid session (expired, other family, signed out): drop the cookie and go back to the picker. */
export async function GET(request: NextRequest) {
  await clearKidCookie();
  return NextResponse.redirect(new URL(PATHS.parent.kidMode, request.url));
}
