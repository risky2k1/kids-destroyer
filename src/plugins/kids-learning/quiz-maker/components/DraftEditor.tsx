'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { QuestionImageField } from '@/plugins/kids-learning/question-bank';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { saveDraftQuiz } from '../actions';
import type { DraftItem } from '../lib/draft';

type TypeOption = { id: string; name: string };
type Item = DraftItem & { imagePath?: string };

export function DraftEditor({
  uid,
  title: initialTitle,
  items: initialItems,
  subjectId,
  gradeId,
  topicId,
  lang,
  dropped,
  left,
  types,
  onBack,
}: {
  uid: string;
  title: string;
  items: DraftItem[];
  subjectId: string;
  gradeId: string;
  topicId: string;
  lang: 'vi' | 'en';
  dropped: number;
  left: number;
  types: TypeOption[];
  onBack: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [state, action, pending] = useActionState(saveDraftQuiz, { ok: true });

  function move(index: number, delta: number) {
    setItems((current) => {
      const next = current.slice();
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  }

  function add(type: string) {
    const plugin = getPlugin(type);
    if (!plugin) return;
    setItems((current) => [
      ...current,
      { type, prompt: '', content: plugin.emptyContent, answer: plugin.emptyAnswer },
    ]);
  }

  return (
    <form action={action} className="flex flex-col gap-4 p-4">
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="gradeId" value={gradeId} />
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <Input
        name="title"
        value={title}
        maxLength={100}
        required
        onChange={(event) => setTitle(event.target.value)}
      />
      {dropped > 0 ? <p className="text-sm">AI bỏ {dropped} câu không hợp lệ</p> : null}
      <p className="text-sm">Còn {left} lượt hôm nay</p>
      <ol className="flex flex-col gap-4">
        {items.map((item, index) => {
          const plugin = getPlugin(item.type);
          const Editor = plugin?.Editor as
            | ((props: {
                content: unknown;
                answer: unknown;
                onChange: (content: unknown, answer: unknown) => void;
              }) => ReactNode)
            | undefined;
          return (
            <li
              key={`${item.type}-${index}`}
              className="flex flex-col gap-2 border-b border-border/20 pb-3"
            >
              <textarea
                className="min-h-16 rounded-base border-2 border-border p-2 text-sm"
                value={item.prompt}
                maxLength={500}
                aria-label={`Đề bài câu ${index + 1}`}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((row, i) =>
                      i === index ? { ...row, prompt: event.target.value } : row,
                    ),
                  )
                }
              />
              <QuestionImageField
                uid={uid}
                imagePath={item.imagePath ?? null}
                onChange={(imagePath) =>
                  setItems((current) =>
                    current.map((row, i) => (i === index ? { ...row, imagePath } : row)),
                  )
                }
              />
              {Editor ? (
                <Editor
                  content={item.content}
                  answer={item.answer}
                  onChange={(content, answer) =>
                    setItems((current) =>
                      current.map((row, i) => (i === index ? { ...row, content, answer } : row)),
                    )
                  }
                />
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="neutral"
                  size="xs"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="xs"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  size="xs"
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                >
                  Xóa
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.id}
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => add(type.id)}
          >
            Thêm câu {type.name}
          </Button>
        ))}
      </div>
      {state.error ? <p className="text-sm">{state.error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="neutral" onClick={onBack}>
          Tạo lại
        </Button>
        <Button type="submit" disabled={pending || items.length === 0}>
          Lưu đề
        </Button>
      </div>
    </form>
  );
}
