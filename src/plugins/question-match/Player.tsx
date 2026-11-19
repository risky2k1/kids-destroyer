'use client';

import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import type { MatchContent, MatchResponse } from './schema';

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: MatchContent;
  value: MatchResponse | undefined;
  onChange: (response: MatchResponse) => void;
  disabled?: boolean;
}) {
  const currentPairs =
    value?.pairs && value.pairs.length === content.left.length
      ? value.pairs
      : content.left.map(() => null);

  function selectRight(leftIndex: number, rawVal: string) {
    if (disabled) return;
    const next = [...currentPairs];
    next[leftIndex] = rawVal === '' ? null : Number(rawVal);
    onChange({ pairs: next });
  }

  return (
    <div className="flex flex-col gap-4">
      {content.left.map((leftText, leftIdx) => {
        const selectedVal = currentPairs[leftIdx];
        const selectId = `match-select-${leftIdx}`;

        return (
          <div
            key={leftIdx}
            className="flex flex-col gap-2 rounded-base border-2 border-border bg-secondary-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-base border-2 border-border bg-main font-heading text-sm font-bold text-main-foreground">
                {leftIdx + 1}
              </span>
              <label
                htmlFor={selectId}
                className="cursor-pointer text-lg font-medium text-foreground"
              >
                {leftText}
              </label>
            </div>

            <div className="w-full sm:w-64">
              <NativeSelect
                id={selectId}
                disabled={disabled}
                value={selectedVal !== null && selectedVal !== undefined ? String(selectedVal) : ''}
                className="h-12 min-h-[48px] text-lg font-medium"
                onChange={(e) => selectRight(leftIdx, e.target.value)}
              >
                <option value="">-- Chọn ghép cặp --</option>
                {content.right.map((rightText, rightIdx) => (
                  <option key={rightIdx} value={String(rightIdx)}>
                    {rightText}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        );
      })}
    </div>
  );
}
