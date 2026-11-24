export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

/**
 * Top-left for a fixed-position button: always on screen. `avoid` is ordered most important
 * first; when no spot misses all of them, the least important rect is dropped and it retries.
 */
export function dodge(
  viewport: Size,
  button: Size,
  avoid: Rect[],
  random: () => number = Math.random,
  margin = 16,
): { x: number; y: number } {
  const maxX = Math.max(margin, viewport.width - button.width - margin);
  const maxY = Math.max(margin, viewport.height - button.height - margin);
  const hits = (p: { x: number; y: number }, r: Rect) =>
    p.x < r.x + r.width &&
    p.x + button.width > r.x &&
    p.y < r.y + r.height &&
    p.y + button.height > r.y;
  let p = { x: margin, y: margin };
  for (let keep = avoid.length; keep >= 0; keep--) {
    const rects = avoid.slice(0, keep);
    for (let i = 0; i < 40; i++) {
      p = {
        x: Math.round(margin + random() * (maxX - margin)),
        y: Math.round(margin + random() * (maxY - margin)),
      };
      if (!rects.some((r) => hits(p, r))) return p;
    }
  }
  return p;
}
