'use client';

import type { GradeResult } from '@/core/plugins';
import type { McqAnswer, McqContent, McqResponse } from './schema';

export function Review({
  content,
  answer,
  response,
}: {
  content: McqContent;
  answer: McqAnswer;
  response: McqResponse | undefined;
  result: GradeResult | undefined;
}) {
  const selected = new Set(response?.selected ?? []);
  const correct = new Set(answer.correct);
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {content.options.map((option, index) => {
        const isCorrect = correct.has(index);
        const isSelected = selected.has(index);
        const wrong = isSelected && !isCorrect;
        return (
          <li key={index} className={wrong ? 'text-foreground/40' : undefined}>
            {isCorrect ? '✅ ' : ''}
            {option || `Phương án ${index + 1}`}
            {isSelected ? ' · đã chọn' : ''}
          </li>
        );
      })}
    </ul>
  );
}
