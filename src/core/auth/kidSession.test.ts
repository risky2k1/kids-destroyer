import { describe, expect, it } from 'vitest';
import { KID_TTL_MS, signKidToken, verifyKidToken } from './kidSession';

const SECRET = 'test-secret';
const NOW = 1_800_000_000_000;

describe('kid token', () => {
  it('round-trips the kid id', () => {
    expect(verifyKidToken(signKidToken('kid-1', SECRET, NOW), SECRET, NOW + 1000)).toBe('kid-1');
  });
  it('rejects a tampered signature', () => {
    const t = signKidToken('kid-1', SECRET, NOW);
    const bad = t.slice(0, -1) + (t.endsWith('A') ? 'B' : 'A');
    expect(verifyKidToken(bad, SECRET, NOW)).toBeNull();
  });
  it('rejects a swapped kid id', () => {
    const [, exp, sig] = signKidToken('kid-1', SECRET, NOW).split('.');
    expect(verifyKidToken(['kid-2', exp, sig].join('.'), SECRET, NOW)).toBeNull();
  });
  it('rejects after expiry', () => {
    const t = signKidToken('kid-1', SECRET, NOW);
    expect(verifyKidToken(t, SECRET, NOW + KID_TTL_MS + 1)).toBeNull();
  });
  it('rejects a different secret', () => {
    expect(verifyKidToken(signKidToken('kid-1', SECRET, NOW), 'other', NOW)).toBeNull();
  });
  it('rejects garbage', () => {
    expect(verifyKidToken('abc', SECRET, NOW)).toBeNull();
  });
});
