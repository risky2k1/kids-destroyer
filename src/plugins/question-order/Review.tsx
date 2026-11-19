'use client';

import type { GradeResult } from '@/core/plugins';
import type { OrderAnswer, OrderContent, OrderResponse } from './schema';

export function Review({
  content,
  answer,
  response,
}: {
  content: OrderContent;
  answer: OrderAnswer;
  response: OrderResponse | undefined;
  result: GradeResult | undefined;
}) {
  if (!response?.order) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="italic text-foreground/70">Bé chưa trả lời.</p>
        <div>
          <p className="font-bold">Thứ tự đúng:</p>
          <ol className="list-inside list-decimal text-foreground/80">
            {answer.order.map((itemIdx) => (
              <li key={itemIdx}>{content.items[itemIdx]}</li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1.5">
        <p className="font-bold">Thứ tự bé đã sắp:</p>
        <ul className="flex flex-col gap-1">
          {response.order.map((itemIdx, pos) => {
            const isCorrect = itemIdx === answer.order[pos];
            return (
              <li key={pos} className={isCorrect ? 'text-foreground' : 'text-foreground/60'}>
                <span className="font-bold">{pos + 1}.</span> {isCorrect ? '✅ ' : '❌ '}
                {content.items[itemIdx]}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-1 border-t border-border/40 pt-2 text-foreground/80">
        <p className="font-bold">Thứ tự đúng:</p>
        <ol className="list-inside list-decimal">
          {answer.order.map((itemIdx) => (
            <li key={itemIdx}>{content.items[itemIdx]}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
