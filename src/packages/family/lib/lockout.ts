export const PIN_MAX_FAILS = 5;
export const PIN_LOCK_MS = 5 * 60 * 1000;

export const isLocked = (lockedUntil: string | null, now: number) =>
  lockedUntil !== null && new Date(lockedUntil).getTime() > now;

export function afterFailedPin(failCount: number, now: number) {
  const next = failCount + 1;
  return next >= PIN_MAX_FAILS
    ? { failCount: 0, lockedUntil: new Date(now + PIN_LOCK_MS).toISOString() }
    : { failCount: next, lockedUntil: null };
}
