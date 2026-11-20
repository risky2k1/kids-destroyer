'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/themes/neobrutal/ui/button';
import type { OrderContent, OrderResponse } from './schema';

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: OrderContent;
  value: OrderResponse | undefined;
  onChange: (response: OrderResponse) => void;
  disabled?: boolean;
}) {
  const currentOrder =
    value?.order && value.order.length === content.items.length
      ? value.order
      : content.items.map((_, i) => i);

  function move(pos: number, direction: 'up' | 'down') {
    if (disabled) return;
    const targetPos = direction === 'up' ? pos - 1 : pos + 1;
    if (targetPos < 0 || targetPos >= currentOrder.length) return;

    const next = [...currentOrder];
    const temp = next[pos]!;
    next[pos] = next[targetPos]!;
    next[targetPos] = temp;
    onChange({ order: next });
  }

  function keepCurrentOrder() {
    if (disabled) return;
    onChange({ order: [...currentOrder] });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {currentOrder.map((itemIndex, pos) => {
          const itemText = content.items[itemIndex] ?? '';
          const canMoveUp = pos > 0;
          const canMoveDown = pos < currentOrder.length - 1;

          return (
            <li
              key={pos}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3 text-lg font-base"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-base border-2 border-border bg-main font-heading text-sm font-bold text-main-foreground">
                  {pos + 1}
                </span>
                <span className="text-lg">{itemText}</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-lg"
                  className="size-11 min-h-[44px] min-w-[44px]"
                  disabled={disabled || !canMoveUp}
                  aria-label={`Chuyển mục "${itemText}" lên trên`}
                  onClick={() => move(pos, 'up')}
                >
                  <ArrowUp className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-lg"
                  className="size-11 min-h-[44px] min-w-[44px]"
                  disabled={disabled || !canMoveDown}
                  aria-label={`Chuyển mục "${itemText}" xuống dưới`}
                  onClick={() => move(pos, 'down')}
                >
                  <ArrowDown className="size-5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {value === undefined ? (
        <Button
          type="button"
          variant="neutral"
          className="min-h-[44px] self-start text-base"
          disabled={disabled}
          onClick={keepCurrentOrder}
        >
          Giữ nguyên thứ tự này
        </Button>
      ) : null}
    </div>
  );
}
