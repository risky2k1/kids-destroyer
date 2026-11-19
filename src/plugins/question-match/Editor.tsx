'use client';

import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { scramble } from './lib/scramble';
import type { MatchAnswer, MatchContent } from './schema';

const field = 'h-8';

interface PairRow {
  left: string;
  right: string;
}

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: MatchContent;
  answer: MatchAnswer;
  onChange: (content: MatchContent, answer: MatchAnswer) => void;
}) {
  // Reconstruct the author's original left-right pairs from content and answer
  const pairs: PairRow[] =
    content.left.length >= 2 &&
    content.right.length >= 2 &&
    answer.pairs.length === content.left.length
      ? content.left.map((leftText, i) => ({
          left: leftText,
          right: content.right[answer.pairs[i]!] ?? '',
        }))
      : [
          { left: '', right: '' },
          { left: '', right: '' },
        ];

  function commit(nextPairs: PairRow[]) {
    const left = nextPairs.map((p) => p.left);
    const rawRight = nextPairs.map((p) => p.right);
    // Scramble the right column: content.right gets scrambled, answer.pairs stores the mapping
    const scrambled = scramble(rawRight);
    onChange({ left, right: scrambled.items }, { pairs: scrambled.order });
  }

  function setLeft(index: number, text: string) {
    const next = pairs.map((pair, i) => (i === index ? { ...pair, left: text } : pair));
    commit(next);
  }

  function setRight(index: number, text: string) {
    const next = pairs.map((pair, i) => (i === index ? { ...pair, right: text } : pair));
    commit(next);
  }

  function addPair() {
    if (pairs.length >= 6) return;
    commit([...pairs, { left: '', right: '' }]);
  }

  function removePair(index: number) {
    if (pairs.length <= 2) return;
    const next = pairs.filter((_, i) => i !== index);
    commit(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-foreground/70">
        Nhập từng <strong>cặp đúng</strong> (Vế trái — Vế phải). Hệ thống sẽ tự động xáo trộn vế
        phải khi hiển thị cho bé.
      </div>

      <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] items-center gap-2 text-xs font-bold text-foreground/70">
        <span>#</span>
        <span>Vế trái</span>
        <span>Vế phải</span>
        <span className="w-10">Thao tác</span>
      </div>

      <ul className="flex flex-col gap-2">
        {pairs.map((pair, index) => {
          const leftId = `match-left-${index}`;
          const rightId = `match-right-${index}`;

          return (
            <li key={index} className="grid grid-cols-[1.5rem_1fr_1fr_auto] items-center gap-2">
              <span className="text-xs font-bold text-foreground/80">{index + 1}</span>

              <div>
                <Label htmlFor={leftId} className="sr-only">
                  Vế trái {index + 1}
                </Label>
                <Input
                  id={leftId}
                  value={pair.left}
                  className={field}
                  placeholder={`Vế trái ${index + 1}`}
                  onChange={(e) => setLeft(index, e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={rightId} className="sr-only">
                  Vế phải {index + 1}
                </Label>
                <Input
                  id={rightId}
                  value={pair.right}
                  className={field}
                  placeholder={`Vế phải ${index + 1}`}
                  onChange={(e) => setRight(index, e.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="neutral"
                size="xs"
                className="h-7 w-10 border shadow-none hover:translate-x-0 hover:translate-y-0"
                disabled={pairs.length <= 2}
                onClick={() => removePair(index)}
              >
                Bỏ
              </Button>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="neutral"
        size="xs"
        className="h-7 self-start border shadow-none hover:translate-x-0 hover:translate-y-0"
        disabled={pairs.length >= 6}
        onClick={addPair}
      >
        Thêm cặp
      </Button>
    </div>
  );
}
