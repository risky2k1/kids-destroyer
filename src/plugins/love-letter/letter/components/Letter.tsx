'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { dodge } from '../lib/dodge';
import { NO_LABEL, SCREENS, YES_LABEL } from '../lib/poem';

const TAP_LOCK_MS = 700;
const BTN =
  'min-h-16 rounded-full px-7 text-xl font-bold shadow-[0_6px_20px_-6px_var(--ll-accent)] transition-transform active:scale-95';
// Fixed spread so server and client render the same hearts.
const HEARTS = Array.from({ length: 20 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * i * 7) % 23) / 5,
  size: 1.4 + ((i * 7) % 10) / 10,
  icon: i % 3 === 0 ? '💖' : '💗',
}));

export function Letter() {
  const [index, setIndex] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [answerable, setAnswerable] = useState(false);
  const lastAdvance = useRef(0);
  const yesRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const screen = SCREENS[index];
  const step = screen.slow ? 1.4 : 0.7;

  // A fixed spot from before a rotation could be off screen: go back inline.
  useEffect(() => {
    const reset = () => setNoPos(null);
    window.addEventListener('resize', reset);
    return () => window.removeEventListener('resize', reset);
  }, []);

  // Answer buttons stay inert until they have faded in, so a stray tap cannot skip the question.
  useEffect(() => {
    if (screen.kind !== 'question') return;
    const t = setTimeout(() => setAnswerable(true), (screen.lines.length * step + 0.9) * 1000);
    return () => clearTimeout(t);
  }, [screen, step]);

  function advance() {
    if (screen.kind !== 'envelope' && screen.kind !== 'verse') return;
    const now = Date.now();
    if (now - lastAdvance.current < TAP_LOCK_MS) return;
    lastAdvance.current = now;
    setIndex((i) => i + 1);
  }

  function runAway(e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const no = noRef.current?.getBoundingClientRect();
    const yes = yesRef.current?.getBoundingClientRect();
    const block = contentRef.current?.getBoundingClientRect();
    if (!no || !yes || !block) return;
    const pad = (r: DOMRect) => ({
      x: r.x - 12,
      y: r.y - 12,
      width: r.width + 24,
      height: r.height + 24,
    });
    setNoPos(
      dodge(
        { width: window.innerWidth, height: window.innerHeight },
        { width: no.width, height: no.height },
        // Never on Yes; off the poem too when the screen has room.
        [pad(yes), pad(block)],
      ),
    );
  }

  return (
    <div
      onClick={advance}
      className="ll-root relative flex min-h-dvh w-full touch-manipulation flex-col items-center justify-center overflow-hidden px-3 py-6 text-center select-none"
    >
      <style>{`
        .ll-root {
          --ll-bg: #fff1f4; --ll-bg2: #ffd9e2; --ll-ink: #5b1a32; --ll-soft: #9c4d68; --ll-accent: #e5466f;
          background: radial-gradient(circle at 50% 30%, var(--ll-bg) 0%, var(--ll-bg2) 100%);
          color: var(--ll-ink);
        }
        @keyframes ll-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes ll-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes ll-float { from { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } to { transform: translateY(-110dvh); opacity: 0; } }
        .ll-line { font-size: clamp(0.95rem, min(4.3vw, 6vh), 1.875rem); }
        .ll-in { opacity: 0; animation: ll-in 0.9s ease-out forwards; }
        .ll-pulse { animation: ll-pulse 1.8s ease-in-out infinite; }
        .ll-heart { position: absolute; bottom: -3rem; animation: ll-float 4.5s ease-in infinite; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) {
          .ll-in { opacity: 1; animation: none; }
          .ll-pulse { animation: none; }
          .ll-heart { display: none; }
        }
      `}</style>

      {screen.kind === 'yes' &&
        HEARTS.map((h, i) => (
          <span
            key={i}
            aria-hidden
            className="ll-heart"
            style={{ left: `${h.left}%`, animationDelay: `${h.delay}s`, fontSize: `${h.size}rem` }}
          >
            {h.icon}
          </span>
        ))}

      <div ref={contentRef} key={index} className="relative flex flex-col items-center gap-[2vh]">
        {screen.kind === 'envelope' && (
          <div aria-hidden className="ll-pulse mb-[2vh] text-[min(6rem,18vh)]">
            💌
          </div>
        )}

        {screen.lines.map((line, i) => (
          <p
            key={i}
            className="ll-in ll-line leading-snug font-semibold whitespace-nowrap"
            style={{ animationDelay: `${i * step}s` }}
          >
            {line}
          </p>
        ))}

        {(screen.kind === 'envelope' || screen.kind === 'verse') && (
          <p
            className="ll-in mt-[4vh] text-base text-(--ll-soft)"
            style={{ animationDelay: `${screen.lines.length * step + 0.3}s` }}
          >
            {screen.kind === 'envelope' ? 'Chạm để mở' : 'chạm để tiếp ›'}
          </p>
        )}

        {screen.kind === 'question' && (
          <div
            className="ll-in mt-[4vh] flex flex-wrap items-center justify-center gap-4"
            style={{
              animationDelay: `${screen.lines.length * step}s`,
              pointerEvents: answerable ? undefined : 'none',
            }}
          >
            <button
              ref={yesRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (answerable) setIndex(SCREENS.length - 1);
              }}
              className={`${BTN} bg-(--ll-accent) text-white`}
            >
              {YES_LABEL}
            </button>
            {noPos && (
              <span aria-hidden className={`${BTN} invisible flex items-center`}>
                {NO_LABEL}
              </span>
            )}
            {/* No onClick on purpose: it moves away before any tap can land. */}
            <button
              ref={noRef}
              type="button"
              onPointerDown={runAway}
              onPointerEnter={(e) => e.pointerType === 'mouse' && runAway(e)}
              onClick={(e) => e.stopPropagation()}
              className={`${BTN} z-10 border-2 border-(--ll-accent) bg-white/80 text-(--ll-ink)`}
              style={
                noPos
                  ? {
                      position: 'fixed',
                      left: noPos.x,
                      top: noPos.y,
                      transition: 'left 0.25s ease-out, top 0.25s ease-out',
                    }
                  : undefined
              }
            >
              {NO_LABEL}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
