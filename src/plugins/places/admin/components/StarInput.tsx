'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

/** Five star buttons feeding a hidden `rating` input; tapping the selected star clears it. */
export function StarInput({ defaultValue }: { defaultValue: number | null }) {
  const [value, setValue] = useState<number | null>(defaultValue);
  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name="rating" value={value ?? ''} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} sao`}
          aria-pressed={value === n}
          onClick={() => setValue(value === n ? null : n)}
          className="inline-flex size-11 items-center justify-center rounded-base hover:bg-foreground/5"
        >
          <Star
            className={
              value !== null && n <= value
                ? 'size-6 fill-main text-foreground'
                : 'size-6 text-foreground/30'
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
