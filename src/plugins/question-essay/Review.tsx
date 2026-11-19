'use client';

import type { GradeResult } from '@/core/plugins';
import type { EssayAnswer, EssayContent, EssayResponse } from './schema';

export function Review({
  answer,
  response,
}: {
  content: EssayContent;
  answer: EssayAnswer;
  response: EssayResponse | undefined;
  result: GradeResult | undefined;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1.5">
        <span className="font-bold">Bài làm của bé:</span>
        <div className="whitespace-pre-wrap rounded-base border-2 border-border bg-secondary-background p-3 text-base">
          {response?.text ? (
            response.text
          ) : (
            <span className="italic text-foreground/60">Bé chưa làm bài</span>
          )}
        </div>
      </div>

      {answer.sample?.trim() ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-foreground/80">Bài mẫu / Gợi ý chấm:</span>
          <div className="whitespace-pre-wrap rounded-base border-2 border-border bg-secondary-background/60 p-3 text-sm">
            {answer.sample}
          </div>
        </div>
      ) : null}
    </div>
  );
}
