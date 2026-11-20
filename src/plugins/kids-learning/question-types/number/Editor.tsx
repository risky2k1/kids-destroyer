'use client';

import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { parseDecimal } from './parseDecimal';
import type { NumberAnswer, NumberContent } from './schema';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: NumberContent;
  answer: NumberAnswer;
  onChange: (content: NumberContent, answer: NumberAnswer) => void;
}) {
  function setValue(raw: string) {
    const value = parseDecimal(raw);
    if (value === null) return;
    onChange(content, { value, tolerance: answer.tolerance });
  }

  function setTolerance(raw: string) {
    const tolerance = parseDecimal(raw);
    if (tolerance === null || tolerance < 0) return;
    onChange(content, { value: answer.value, tolerance });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="number-value">Đáp án</Label>
        <Input
          id="number-value"
          inputMode="decimal"
          defaultValue={answer.value}
          className="h-8"
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="number-tolerance">Sai số cho phép</Label>
        <Input
          id="number-tolerance"
          inputMode="decimal"
          defaultValue={answer.tolerance}
          className="h-8"
          onChange={(event) => setTolerance(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="number-unit">Đơn vị</Label>
        <Input
          id="number-unit"
          defaultValue={content.unit ?? ''}
          className="h-8"
          onChange={(event) => onChange({ unit: event.target.value }, answer)}
        />
      </div>
    </div>
  );
}
