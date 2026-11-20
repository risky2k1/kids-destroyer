import { describe, expect, it } from 'vitest';
import { afterFailedPin, isLocked, PIN_LOCK_MS } from './lockout';

const T = 1_800_000_000_000;

describe('PIN lockout', () => {
  it('counts a failure', () => {
    expect(afterFailedPin(0, T)).toEqual({ failCount: 1, lockedUntil: null });
  });
  it('locks for 5 minutes on the 5th failure and resets the counter', () => {
    expect(afterFailedPin(4, T)).toEqual({
      failCount: 0,
      lockedUntil: new Date(T + PIN_LOCK_MS).toISOString(),
    });
    expect(PIN_LOCK_MS).toBe(300_000);
  });
  it('is locked until the time passes', () => {
    expect(isLocked(new Date(T + 1).toISOString(), T)).toBe(true);
    expect(isLocked(new Date(T - 1).toISOString(), T)).toBe(false);
    expect(isLocked(null, T)).toBe(false);
  });
});
