'use client';

import { useState } from 'react';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { composeFill, parseFill } from './lib/parseFill';
import type { FillAnswer, FillContent } from './schema';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: FillContent;
  answer: FillAnswer;
  onChange: (content: FillContent, answer: FillAnswer) => void;
}) {
  const [source, setSource] = useState(() => composeFill(content.text, answer.blanks));
  const [error, setError] = useState<string | null>(null);

  function edit(next: string) {
    setSource(next);
    const parsed = parseFill(next);
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }
    setError(null);
    onChange({ text: parsed.text }, { blanks: parsed.blanks });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="fill-source">Câu có chỗ trống</Label>
      <Textarea
        id="fill-source"
        value={source}
        aria-invalid={error ? true : undefined}
        onChange={(event) => edit(event.target.value)}
      />
      <p className="text-sm text-foreground/60">
        Đặt đáp án trong [[ ]], ngăn cách bằng | nếu có nhiều cách đúng. Ví dụ: Con mèo có [[4|bốn]]
        chân.
      </p>
      {error ? <p className="text-sm">{error}</p> : null}
    </div>
  );
}
