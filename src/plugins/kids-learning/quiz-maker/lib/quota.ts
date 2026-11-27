export const DAILY_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export function quotaLeft(timestamps: string[], now: Date): number {
  const cutoff = now.getTime() - DAY_MS;
  const used = timestamps.filter((stamp) => new Date(stamp).getTime() >= cutoff).length;
  return Math.max(0, DAILY_LIMIT - used);
}
