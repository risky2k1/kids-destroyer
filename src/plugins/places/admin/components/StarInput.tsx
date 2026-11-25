'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type Props = {
  name?: string;
  defaultValue?: number | null;
  value?: number | null;
  onChange?: (next: number | null) => void;
  size?: 'sm' | 'md';
};

/** Five star buttons feeding a hidden input; tapping the selected star clears it. */
export function StarInput({
  name = 'rating',
  defaultValue = null,
  value: controlled,
  onChange,
  size = 'md',
}: Props) {
  const [internal, setInternal] = useState<number | null>(defaultValue);
  const value = controlled !== undefined ? controlled : internal;
  const set = (next: number | null) => {
    if (controlled === undefined) setInternal(next);
    onChange?.(next);
  };
  const btnCls = size === 'sm' ? 'size-9' : 'size-11';
  const iconCls = size === 'sm' ? 'size-5' : 'size-6';

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value ?? ''} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} sao`}
          aria-pressed={value === n}
          onClick={() => set(value === n ? null : n)}
          className={`inline-flex ${btnCls} items-center justify-center rounded-base hover:bg-foreground/5`}
        >
          <Star
            className={
              value !== null && n <= value
                ? `${iconCls} fill-main text-foreground`
                : `${iconCls} text-foreground/30`
            }
          />
        </button>
      ))}
      <span className="ml-1 text-sm text-foreground/60">
        {value === null ? 'Chưa chấm' : `${value}/5`}
      </span>
    </div>
  );
}
