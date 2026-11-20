'use client';

import { useId } from 'react';
import { Button } from '@/themes/neobrutal/ui/button';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import type { McqAnswer, McqContent } from './schema';

const field = 'h-8';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: McqContent;
  answer: McqAnswer;
  onChange: (content: McqContent, answer: McqAnswer) => void;
}) {
  const radioName = useId();

  function commit(nextContent: McqContent, correct: number[]) {
    onChange(nextContent, { correct });
  }

  function setMultiple(multiple: boolean) {
    const correct = multiple ? answer.correct : answer.correct.slice(0, 1);
    commit({ ...content, multiple }, correct.length > 0 ? correct : [0]);
  }

  function mark(index: number, checked: boolean) {
    if (!content.multiple) {
      commit(content, [index]);
      return;
    }
    const correct = checked
      ? [...answer.correct, index]
      : answer.correct.filter((item) => item !== index);
    commit(content, correct);
  }

  function setOption(index: number, value: string) {
    const options = content.options.map((option, i) => (i === index ? value : option));
    commit({ ...content, options }, answer.correct);
  }

  function addOption() {
    if (content.options.length >= 6) return;
    commit({ ...content, options: [...content.options, ''] }, answer.correct);
  }

  function removeOption(index: number) {
    if (content.options.length <= 2) return;
    const options = content.options.filter((_, i) => i !== index);
    const correct = answer.correct
      .filter((item) => item !== index)
      .map((item) => (item > index ? item - 1 : item));
    commit({ ...content, options }, correct.length > 0 ? correct : [0]);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={content.multiple} onCheckedChange={setMultiple} />
        Nhiều đáp án đúng
      </label>
      <ul className="flex flex-col gap-2">
        {content.options.map((option, index) => {
          const checked = answer.correct.includes(index);
          const id = `${radioName}-${index}`;
          return (
            <li key={id} className="flex items-center gap-2">
              {content.multiple ? (
                <Checkbox
                  checked={checked}
                  aria-label={`Đáp án đúng ${index + 1}`}
                  onCheckedChange={(next) => mark(index, next)}
                />
              ) : (
                <input
                  type="radio"
                  name={radioName}
                  className="size-4"
                  checked={checked}
                  aria-label={`Đáp án đúng ${index + 1}`}
                  onChange={() => mark(index, true)}
                />
              )}
              <Label htmlFor={id} className="sr-only">
                Phương án {index + 1}
              </Label>
              <Input
                id={id}
                value={option}
                className={field}
                onChange={(event) => setOption(index, event.target.value)}
              />
              <Button
                type="button"
                variant="neutral"
                size="xs"
                className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                disabled={content.options.length <= 2}
                onClick={() => removeOption(index)}
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
        disabled={content.options.length >= 6}
        onClick={addOption}
      >
        Thêm phương án
      </Button>
    </div>
  );
}
