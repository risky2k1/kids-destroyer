'use client';

import { useId } from 'react';
import type { McqContent, McqResponse } from './schema';

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: McqContent;
  value: McqResponse | undefined;
  onChange: (response: McqResponse) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const selected = value?.selected ?? [];

  function pick(index: number, checked: boolean) {
    if (content.multiple) {
      const next = checked ? [...selected, index] : selected.filter((item) => item !== index);
      onChange({ selected: next });
      return;
    }
    onChange({ selected: [index] });
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="sr-only">Chọn đáp án</legend>
      {content.options.map((option, index) => {
        const on = selected.includes(index);
        return (
          <label
            key={`${name}-${index}`}
            className="flex min-h-11 items-center gap-3 rounded-base border-2 border-border bg-secondary-background px-3 text-base"
          >
            <input
              type={content.multiple ? 'checkbox' : 'radio'}
              name={name}
              className="size-4"
              checked={on}
              onChange={(event) => pick(index, event.target.checked)}
            />
            <span>{option || `Phương án ${index + 1}`}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
