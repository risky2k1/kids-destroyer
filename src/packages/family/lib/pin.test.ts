import { describe, expect, it } from 'vitest';
import { hashPin, verifyPin } from './pin';

describe('PIN hashing', () => {
  it('verifies the right PIN', async () => {
    expect(await verifyPin('1234', await hashPin('1234'))).toBe(true);
  });
  it('rejects a wrong PIN', async () => {
    expect(await verifyPin('4321', await hashPin('1234'))).toBe(false);
  });
  it('salts each hash', async () => {
    expect(await hashPin('1234')).not.toBe(await hashPin('1234'));
  });
  it('returns false on a malformed stored hash', async () => {
    expect(await verifyPin('1234', 'rác')).toBe(false);
    expect(await verifyPin('1234', 'scrypt$$')).toBe(false);
  });
});
