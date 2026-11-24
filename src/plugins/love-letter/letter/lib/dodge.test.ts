import { describe, expect, it } from 'vitest';
import { dodge } from './dodge';

const btn = { width: 160, height: 56 };
const avoid = { x: 100, y: 300, width: 180, height: 64 };
const inside = (p: { x: number; y: number }, vw: number, vh: number, m = 16) =>
  p.x >= m && p.y >= m && p.x + btn.width <= vw - m && p.y + btn.height <= vh - m;
const overlaps = (p: { x: number; y: number }) =>
  p.x < avoid.x + avoid.width &&
  p.x + btn.width > avoid.x &&
  p.y < avoid.y + avoid.height &&
  p.y + btn.height > avoid.y;

describe('dodge', () => {
  it('stays inside a portrait phone and off the avoid rect for many random draws', () => {
    for (let i = 0; i < 500; i++) {
      const p = dodge({ width: 375, height: 667 }, btn, avoid);
      expect(inside(p, 375, 667)).toBe(true);
      expect(overlaps(p)).toBe(false);
    }
  });

  it('stays inside a landscape phone', () => {
    const p = dodge({ width: 667, height: 375 }, btn, { x: 250, y: 150, width: 180, height: 64 });
    expect(inside(p, 667, 375)).toBe(true);
  });

  it('is deterministic for a given random', () => {
    const r = () => 0.5;
    expect(dodge({ width: 375, height: 667 }, btn, avoid, r)).toEqual(
      dodge({ width: 375, height: 667 }, btn, avoid, r),
    );
  });

  it('still returns an on-screen spot when the avoid rect covers everything', () => {
    const p = dodge({ width: 375, height: 667 }, btn, { x: 0, y: 0, width: 375, height: 667 });
    expect(inside(p, 375, 667)).toBe(true);
  });

  it('clamps to the margin when the viewport is smaller than the button', () => {
    expect(dodge({ width: 100, height: 40 }, btn, avoid)).toEqual({ x: 16, y: 16 });
  });
});
