'use client';

import type { ReactNode } from 'react';
import { PRICE_LABELS, PRICE_LEVELS, type Tag } from '@/plugins/places/shared';
import type { Filters, PickMode } from '../lib/pick';

const MODES: { id: PickMode; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'visited', label: 'Quán quen' },
  { id: 'wishlist', label: 'Quán mới' },
];
const RATINGS: { value: number | null; label: string }[] = [
  { value: null, label: 'Tất cả' },
  { value: 3, label: '≥ 3★' },
  { value: 4, label: '≥ 4★' },
  { value: 5, label: '5★' },
];

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-base border-2 border-border bg-secondary-background px-3 text-sm aria-pressed:bg-main aria-pressed:text-main-foreground"
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-heading uppercase text-foreground/60">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

type Props = { filters: Filters; onChange: (f: Filters) => void; tags: Tag[] };

export function FilterBar({ filters, onChange, tags }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const tagRow = (kind: Tag['kind'], label: string, key: 'categoryIds' | 'vibeIds' | 'areaIds') => {
    const ofKind = tags.filter((t) => t.kind === kind);
    if (ofKind.length === 0) return null;
    return (
      <Row label={label}>
        {ofKind.map((t) => (
          <Chip
            key={t.id}
            active={filters[key].includes(t.id)}
            onClick={() => set({ [key]: toggle(filters[key], t.id) })}
          >
            {t.emoji && <span aria-hidden>{t.emoji}</span>}
            {t.name}
          </Chip>
        ))}
      </Row>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="grid grid-cols-3 gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={filters.mode === m.id}
            onClick={() => set({ mode: m.id })}
            className="min-h-11 rounded-base border-2 border-border bg-secondary-background text-sm font-heading aria-selected:bg-main aria-selected:text-main-foreground"
          >
            {m.label}
          </button>
        ))}
      </div>
      {tagRow('category', 'Loại', 'categoryIds')}
      {tagRow('vibe', 'Vibe', 'vibeIds')}
      {tagRow('area', 'Khu', 'areaIds')}
      <Row label="Giá">
        {PRICE_LEVELS.map((p) => (
          <Chip
            key={p}
            active={filters.prices.includes(p)}
            onClick={() => set({ prices: toggle(filters.prices, p) })}
          >
            {PRICE_LABELS[p]}
          </Chip>
        ))}
      </Row>
      <Row label="Sao">
        {RATINGS.map((r) => (
          <Chip
            key={r.label}
            active={filters.minRating === r.value}
            onClick={() => set({ minRating: r.value })}
          >
            {r.label}
          </Chip>
        ))}
      </Row>
    </div>
  );
}
