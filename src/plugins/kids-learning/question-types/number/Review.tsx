'use client';

import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { NumberAnswer, NumberContent, NumberResponse } from './schema';

export function Review({
  content,
  answer,
  response,
}: {
  content: NumberContent;
  answer: NumberAnswer;
  response: NumberResponse | undefined;
  result: GradeResult | undefined;
}) {
  const unit = content.unit ? ` ${content.unit}` : '';
  return (
    <p className="text-sm">
      {response ? `${response.value}${unit}` : '…'} — đáp án {answer.value}
      {answer.tolerance > 0 ? ` ± ${answer.tolerance}` : ''}
      {unit}
    </p>
  );
}
