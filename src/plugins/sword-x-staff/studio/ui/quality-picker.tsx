'use client';

import { QUALITIES, QUALITY_CLASS } from '../lib/options';
import { cn } from '@/themes/neobrutal/lib/utils';

const STARS = [1, 2, 3, 4, 5];

export function QualityRadios({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (quality: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-sm font-heading">
      {QUALITIES.map((quality) => (
        <label key={quality} className={cn('flex items-center gap-1', QUALITY_CLASS[quality])}>
          <input
            type="radio"
            name={name}
            checked={value === quality}
            onChange={() => onChange(quality)}
          />
          {quality}
        </label>
      ))}
    </div>
  );
}

export function StarRow({ value, onChange }: { value: number; onChange: (stars: number) => void }) {
  return (
    <div className="flex items-center gap-1 leading-none text-yellow-400">
      <button
        type="button"
        className={cn(
          'border-2 border-border px-1.5 py-0.5 text-xs font-heading',
          value === 0 ? 'bg-main text-foreground' : 'bg-background text-muted-foreground',
        )}
        onClick={() => onChange(0)}
        aria-label="0 stars"
      >
        0★
      </button>
      <div className="flex gap-1 text-xl">
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            className="text-yellow-400"
            onClick={() => onChange(value === 1 && star === 1 ? 0 : star)}
            aria-label={`${star} stars`}
          >
            {star <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );
}
