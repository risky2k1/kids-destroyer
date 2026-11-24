'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place } from '@/plugins/places/shared';
import { pickRandom } from '../lib/pick';

/** Gaps (ms) between flicked names: fast at first, slowing to a stop (~1 s total). */
const STEPS = [60, 60, 70, 80, 90, 110, 130, 160, 200];

export function useShuffle(candidates: Place[]) {
  const [current, setCurrent] = useState<Place | null>(null);
  const [flash, setFlash] = useState<Place | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const rolling = flash !== null;

  function shuffle() {
    if (rolling || candidates.length === 0) return;
    const result = pickRandom(candidates, current?.id ?? null);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || candidates.length === 1) {
      setCurrent(result);
      return;
    }
    let at = 0;
    timers.current = STEPS.map((gap) => {
      at += gap;
      return window.setTimeout(
        () => setFlash(candidates[Math.floor(Math.random() * candidates.length)]),
        at,
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setFlash(null);
        setCurrent(result);
      }, at + 220),
    );
    setFlash(candidates[0]);
  }

  // A pick that no longer matches the filters is hidden rather than kept on screen.
  const shown = current && candidates.some((p) => p.id === current.id) ? current : null;

  return { current: flash ?? shown, rolling, shuffle };
}
