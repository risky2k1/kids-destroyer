'use client';

import type { GradeResult } from '@/plugins/kids-learning/question-types';
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
          return (
            <li key={index}>
              {given || '…'} — chấp nhận: {accepted.join(', ')}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
