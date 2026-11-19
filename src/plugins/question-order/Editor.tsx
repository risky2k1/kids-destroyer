'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { scramble } from './lib/scramble';
import type { OrderAnswer, OrderContent } from './schema';

const field = 'h-8';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: OrderContent;
  answer: OrderAnswer;
  onChange: (content: OrderContent, answer: OrderAnswer) => void;
}) {
  // Reconstruct the author's correct items list from answer.order and content.items
  const correctItems: string[] =
    answer.order.length === content.items.length && content.items.length >= 2
      ? answer.order.map((idx) => content.items[idx] ?? '')
      : content.items.length >= 2
        ? [...content.items]
        : ['', ''];

  function commit(nextCorrectItems: string[]) {
    // Scramble the correct items: content.items gets scrambled, answer.order stores the permutation
    const scrambled = scramble(nextCorrectItems);
    onChange({ items: scrambled.items }, { order: scrambled.order });
  }

  function setItemText(index: number, text: string) {
    const next = correctItems.map((item, i) => (i === index ? text : item));
    commit(next);
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= correctItems.length) return;
    const next = [...correctItems];
    const temp = next[index]!;
    next[index] = next[targetIndex]!;
    next[targetIndex] = temp;
    commit(next);
  }

  function addItem() {
    if (correctItems.length >= 8) return;
    commit([...correctItems, '']);
  }

  function removeItem(index: number) {
    if (correctItems.length <= 2) return;
    const next = correctItems.filter((_, i) => i !== index);
    commit(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-foreground/70">
        Nhập các mục theo <strong>thứ tự đúng</strong>. Hệ thống sẽ tự động xáo trộn khi hiển thị
        cho bé.
      </div>

      <ul className="flex flex-col gap-2">
        {correctItems.map((item, index) => {
          const id = `order-item-${index}`;
          return (
            <li key={index} className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-base border border-border bg-secondary-background text-xs font-bold">
                {index + 1}
              </span>
              <Label htmlFor={id} className="sr-only">
                Mục {index + 1}
              </Label>
              <Input
                id={id}
                value={item}
                className={field}
                placeholder={`Nội dung mục ${index + 1}`}
                onChange={(event) => setItemText(index, event.target.value)}
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-xs"
                  className="size-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                  disabled={index === 0}
                  aria-label="Chuyển lên"
                  onClick={() => moveItem(index, 'up')}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-xs"
                  className="size-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                  disabled={index === correctItems.length - 1}
                  aria-label="Chuyển xuống"
                  onClick={() => moveItem(index, 'down')}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="xs"
                  className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                  disabled={correctItems.length <= 2}
                  onClick={() => removeItem(index)}
                >
                  Bỏ
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="neutral"
        size="xs"
        className="h-7 self-start border shadow-none hover:translate-x-0 hover:translate-y-0"
        disabled={correctItems.length >= 8}
        onClick={addItem}
      >
        Thêm mục
      </Button>
    </div>
  );
}
