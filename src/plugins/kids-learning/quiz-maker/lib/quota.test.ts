import { describe, expect, it } from 'vitest';
import { quotaLeft } from './quota';

const now = new Date('2026-11-27T12:00:00.000Z');

describe('quotaLeft', () => {
  it('is zero after ten generations in the last day', () => {
    const stamps = Array.from({ length: 10 }, (_, i) =>
      new Date(now.getTime() - i * 60_000).toISOString(),
    );
    expect(quotaLeft(stamps, now)).toBe(0);
  });

  it('ignores generations older than 24 hours', () => {
    const recent = Array.from({ length: 9 }, (_, i) =>
      new Date(now.getTime() - i * 60_000).toISOString(),
    );
    const old = Array.from({ length: 3 }, (_, i) =>
      new Date(now.getTime() - 25 * 60 * 60 * 1000 - i * 60_000).toISOString(),
    );
    expect(quotaLeft([...recent, ...old], now)).toBe(1);
  });
});
