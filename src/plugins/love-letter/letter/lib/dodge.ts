export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

/** Top-left for a fixed-position button: on screen, and off `avoid` when there is room. */
export function dodge(
  viewport: Size,
  button: Size,
  avoid: Rect,
  random: () => number = Math.random,
  margin = 16,
): { x: number; y: number } {
  const maxX = Math.max(margin, viewport.width - button.width - margin);
  const maxY = Math.max(margin, viewport.height - button.height - margin);
  let p = { x: margin, y: margin };
  for (let i = 0; i < 20; i++) {
    p = {
      x: Math.round(margin + random() * (maxX - margin)),
      y: Math.round(margin + random() * (maxY - margin)),
    };
    const hit =
      p.x < avoid.x + avoid.width &&
      p.x + button.width > avoid.x &&
      p.y < avoid.y + avoid.height &&
      p.y + button.height > avoid.y;
    if (!hit) return p;
  }
  return p;
}
