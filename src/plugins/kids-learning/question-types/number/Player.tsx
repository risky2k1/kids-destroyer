'use client';

import { Input } from '@/themes/neobrutal/ui/input';
import { parseDecimal } from './parseDecimal';
import type { NumberContent, NumberResponse } from './schema';

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: NumberContent;
  value: NumberResponse | undefined;
  onChange: (response: NumberResponse) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        inputMode="decimal"
        disabled={disabled}
        aria-label="Nhập số"
        defaultValue={value?.value ?? ''}
        className="h-11 w-32 min-w-16"
        onChange={(event) => {
          const next = parseDecimal(event.target.value);
          if (next === null) return;
          onChange({ value: next });
        }}
      />
      {content.unit ? <span className="text-base">{content.unit}</span> : null}
    </div>
  );
}
