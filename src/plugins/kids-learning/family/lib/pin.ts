import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const KEYLEN = 32;
const SEP = '$';

/** Format: scrypt$<saltB64>$<hashB64>. */
export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pin, salt, KEYLEN);
  return ['scrypt', salt.toString('base64'), hash.toString('base64')].join(SEP);
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split(SEP);
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  if (expected.length !== KEYLEN) return false;
  const actual = await scrypt(pin, Buffer.from(saltB64, 'base64'), KEYLEN);
  return timingSafeEqual(actual, expected);
}
