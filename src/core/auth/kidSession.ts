import { createHmac, timingSafeEqual } from 'node:crypto';

export const KID_COOKIE = 'kd_kid';
export const KID_TTL_MS = 12 * 60 * 60 * 1000;

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

/** Token: <kidId>.<expMs>.<hmac(kidId.expMs)>. */
export function signKidToken(kidId: string, secret: string, now: number): string {
  const payload = `${kidId}.${now + KID_TTL_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyKidToken(token: string, secret: string, now: number): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [kidId, exp, sig] = parts;
  const expected = Buffer.from(sign(`${kidId}.${exp}`, secret));
  const actual = Buffer.from(sig);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  if (!(Number(exp) > now)) return null;
  return kidId;
}
