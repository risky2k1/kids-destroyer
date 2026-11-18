'use client';

import type { GradeResult } from '@/core/plugins';
import type { NumberAnswer, NumberContent, NumberResponse } from './schema';

export function Review({
  content,
  answer,
  response,
  result,
}: {
  content: NumberContent;
  answer: NumberAnswer;
  response: NumberResponse | undefined;
  result: GradeResult | undefined;
}) {
  const unit = content.unit ? ` ${content.unit}` : '';
  const ok =
    result !== undefined
      ? result.score === 1
      : response !== undefined && Math.abs(response.value - answer.value) <= answer.tolerance;
  return (
    <p className="text-sm">
      {response ? `${ok ? '✅' : '❌'} ${response.value}${unit}` : '…'} — đáp án {answer.value}
      {answer.tolerance > 0 ? ` ± ${answer.tolerance}` : ''}
      {unit}
    </p>
  );
}
