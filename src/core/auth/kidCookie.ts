import 'server-only';
import { cookies } from 'next/headers';
import { KID_COOKIE, KID_TTL_MS, signKidToken, verifyKidToken } from './kidSession';

function secret(): string {
  const s = process.env.KID_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('KID_SESSION_SECRET missing or shorter than 32 chars');
  return s;
}

/** Only callable from server actions / route handlers (cookie writes). */
export async function setKidCookie(kidId: string) {
  (await cookies()).set(KID_COOKIE, signKidToken(kidId, secret(), Date.now()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: KID_TTL_MS / 1000,
  });
}

export async function clearKidCookie() {
  (await cookies()).delete(KID_COOKIE);
}

/** Kid id from a valid, unexpired cookie — not yet checked against the parent session. */
export async function readKidCookie(): Promise<string | null> {
  const token = (await cookies()).get(KID_COOKIE)?.value;
  return token ? verifyKidToken(token, secret(), Date.now()) : null;
}
