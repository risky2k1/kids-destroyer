'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/themes/neobrutal/lib/utils';
import { Button } from './button';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const pad2 = (n: number) => String(n).padStart(2, '0');

function parseDateParts(dateStr: string | null | undefined): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  // Monday = 0 .. Sunday = 6
  const startOffset = (first.getDay() + 6) % 7;
  const cells: { ymd: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    cells.push({
      ymd: formatYmd(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }
  return cells;
}

type Props = {
  selected?: string | null;
  onSelect: (dateStr: string) => void;
  className?: string;
};

export function Calendar({ selected, onSelect, className }: Props) {
  const parsed = parseDateParts(selected);
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    if (parsed) return { year: parsed.year, month: parsed.month };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const cells = buildMonthCells(view.year, view.month);
  const now = new Date();
  const todayYmd = formatYmd(now.getFullYear(), now.getMonth(), now.getDate());

  function shiftMonth(delta: number) {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function pickToday() {
    const d = new Date();
    setView({ year: d.getFullYear(), month: d.getMonth() });
    onSelect(formatYmd(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  return (
    <div data-slot="calendar" className={cn('flex w-64 flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          size="icon-xs"
          variant="neutral"
          aria-label="Tháng trước"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-heading">
          Tháng {view.month + 1}, {view.year}
        </span>
        <Button
          type="button"
          size="icon-xs"
          variant="neutral"
          aria-label="Tháng sau"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-heading text-foreground/60">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = selected === cell.ymd;
          const isToday = cell.ymd === todayYmd;
          return (
            <button
              key={cell.ymd}
              type="button"
              onClick={() => {
                if (!cell.inMonth) {
                  const p = parseDateParts(cell.ymd);
                  if (p) setView({ year: p.year, month: p.month });
                }
                onSelect(cell.ymd);
              }}
              className={cn(
                'flex h-8 items-center justify-center rounded-base border-2 text-xs transition-colors',
                isSelected
                  ? 'border-border bg-main font-heading text-main-foreground'
                  : isToday
                    ? 'border-border/50 bg-secondary-background font-heading text-foreground hover:bg-foreground/10'
                    : cell.inMonth
                      ? 'border-transparent hover:border-border/30 hover:bg-foreground/5'
                      : 'border-transparent text-foreground/35 hover:bg-foreground/5',
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end border-t-2 border-border/15 pt-2">
        <Button type="button" size="xs" variant="neutral" onClick={pickToday}>
          Hôm nay
        </Button>
      </div>
    </div>
  );
}
