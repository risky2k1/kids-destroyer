'use client';

import { Input } from '@/themes/neobrutal/ui/input';
import type { FillContent, FillResponse } from './schema';

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: FillContent;
  value: FillResponse | undefined;
  onChange: (response: FillResponse) => void;
  disabled?: boolean;
}) {
  const parts = content.text.split('[[]]');
  const blankCount = Math.max(parts.length - 1, 0);

  function setBlank(index: number, raw: string) {
    const values = Array.from({ length: blankCount }, (_, i) => value?.values[i] ?? '');
    values[index] = raw;
    onChange({ values });
  }

  return (
    <p className="text-base leading-loose">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < blankCount ? (
            <Input
              value={value?.values[index] ?? ''}
              disabled={disabled}
              aria-label={`Chỗ trống ${index + 1}`}
              className="mx-1 inline-flex h-11 w-auto min-w-16"
              onChange={(event) => setBlank(index, event.target.value)}
            />
          ) : null}
        </span>
      ))}
    </p>
  );
}
