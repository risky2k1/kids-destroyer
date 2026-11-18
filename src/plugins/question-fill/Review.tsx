'use client';

import type { GradeResult } from '@/core/plugins';
import { normalizeFill } from './lib/normalize';
import type { FillAnswer, FillContent, FillResponse } from './schema';

export function Review({
  content,
  answer,
  response,
}: {
  content: FillContent;
  answer: FillAnswer;
  response: FillResponse | undefined;
  result: GradeResult | undefined;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p>{content.text}</p>
      <ul className="flex flex-col gap-1">
        {answer.blanks.map((accepted, index) => {
          const given = response?.values[index] ?? '';
          const norm = normalizeFill(given);
          const ok = norm !== '' && accepted.some((option) => normalizeFill(option) === norm);
          return (
            <li key={index}>
              {ok ? '✅' : '❌'} {given || '…'} — chấp nhận: {accepted.join(', ')}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
