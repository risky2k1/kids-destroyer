/** Formats a decimal rating concisely: 4 -> "4", 4.33 -> "4.3". */
export function formatRatingValue(rating: number): string {
  const rounded = Math.round(rating * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Formats rating with optional visit count, e.g. "4.3★ (3 lần)". */
export function formatRatingSummary(rating: number | null, visitCount: number): string {
  if (rating === null) {
    return visitCount > 0 ? `Chưa chấm (${visitCount} lần)` : 'Chưa chấm';
  }
  const base = `${formatRatingValue(rating)}★`;
  return visitCount > 1 ? `${base} (${visitCount} lần)` : base;
}
