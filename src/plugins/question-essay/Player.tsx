'use client';

import { Textarea } from '@/themes/neobrutal/ui/textarea';
import type { EssayContent, EssayResponse } from './schema';

function countWords(str: string): number {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: EssayContent;
  value: EssayResponse | undefined;
  onChange: (response: EssayResponse) => void;
  disabled?: boolean;
}) {
  const text = value?.text ?? '';
  const words = countWords(text);
  const minWords = content.minWords ?? 0;
  const showReminder = minWords > 0 && words < minWords;

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={text}
        disabled={disabled}
        maxLength={2000}
        placeholder="Nhập bài làm của bé tại đây..."
        className="min-h-48 w-full p-4 text-lg font-base"
        onChange={(e) => onChange({ text: e.target.value })}
      />
      <div className="flex items-center justify-between text-base">
        <span className="font-medium text-foreground/80">
          Số từ: <span className="font-bold">{words}</span>
          {minWords > 0 ? ` / tối thiểu ${minWords} từ` : ''}
        </span>
        {showReminder ? (
          <span className="font-semibold text-amber-600">Cần ít nhất {minWords} từ</span>
        ) : null}
      </div>
    </div>
  );
}
