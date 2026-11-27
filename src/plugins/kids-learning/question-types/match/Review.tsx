'use client';

import type { GradeResult } from '@/plugins/kids-learning/question-types';
import type { MatchAnswer, MatchContent, MatchResponse } from './schema';

export function Review({
  content,
  answer,
  response,
}: {
  content: MatchContent;
  answer: MatchAnswer;
  response: MatchResponse | undefined;
  result: GradeResult | undefined;
}) {
  return (
    <ul className="flex flex-col gap-2.5 text-sm">
      {content.left.map((leftItem, i) => {
        const kidRightIdx = response?.pairs?.[i];
        const correctRightIdx = answer.pairs[i];
        const isCorrect =
          kidRightIdx !== undefined && kidRightIdx !== null && kidRightIdx === correctRightIdx;
        const kidChosenText =
          kidRightIdx !== undefined && kidRightIdx !== null
            ? (content.right[kidRightIdx] ?? 'Không rõ')
            : 'Chưa chọn';
        const correctText =
          correctRightIdx !== undefined && correctRightIdx !== null
            ? (content.right[correctRightIdx] ?? '')
            : '';

        return (
          <li key={i} className="flex flex-col gap-1 rounded-base border border-border/40 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground">{leftItem}</span>
              <span className="text-foreground/60">→</span>
              <span className={isCorrect ? 'font-medium text-foreground' : 'text-foreground/70'}>
                {kidChosenText}
              </span>
            </div>

            {!isCorrect ? (
              <div className="text-xs text-foreground/70 pl-6">
                Đáp án đúng:{' '}
                <span className="font-semibold text-foreground">
                  {leftItem} → {correctText}
                </span>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
