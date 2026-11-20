'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { assign } from '../actions';
import type { AssignableKid, QuizOption } from '../queries';

export function AssignForm({ quizzes, kids }: { quizzes: QuizOption[]; kids: AssignableKid[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [state, formAction, pending] = useActionToast(assign, 'Đã giao bài');
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  function toggleKid(id: string) {
    setSelectedKidIds((current) =>
      current.includes(id) ? current.filter((k) => k !== id) : [...current, id],
    );
  }

  function selectAllKids() {
    if (selectedKidIds.length === kids.length) {
      setSelectedKidIds([]);
    } else {
      setSelectedKidIds(kids.map((k) => k.id));
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => setSelectedKidIds([])}
      className="flex flex-col gap-4 rounded-base border-2 border-border bg-main/5 p-4 shadow-[2px_2px_0_0_var(--color-border)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quizId" className="font-heading text-sm">
            Đề bài
          </Label>
          <NativeSelect id="quizId" name="quizId" defaultValue="" required className="h-9">
            <option value="">-- Chọn đề --</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title} ({quiz.questionCount} câu)
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueAt" className="font-heading text-sm">
            Hạn nộp (tùy chọn)
          </Label>
          <Input id="dueAt" name="dueAt" type="datetime-local" className="h-9" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-heading text-sm">Bé làm bài</Label>
          {kids.length > 1 && (
            <button
              type="button"
              onClick={selectAllKids}
              className="text-xs text-foreground/60 underline hover:text-foreground"
            >
              {selectedKidIds.length === kids.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          )}
        </div>

        {kids.length === 0 ? (
          <p className="text-xs text-foreground/60">Chưa có bé nào để giao bài.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {kids.map((kid) => {
              const checked = selectedKidIds.includes(kid.id);
              return (
                <label
                  key={kid.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-base border-2 px-3 py-1.5 text-sm transition-colors ${
                    checked
                      ? 'border-border bg-main font-heading shadow-[2px_2px_0_0_var(--color-border)]'
                      : 'border-border/40 bg-background hover:bg-foreground/5'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleKid(kid.id)}
                    aria-label={`Chọn bé ${kid.name}`}
                  />
                  <span>{kid.avatar}</span>
                  <span>{kid.name}</span>
                  {kid.familyName && (
                    <span className="text-xs text-foreground/60 font-base">({kid.familyName})</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {selectedKidIds.map((id) => (
        <input key={id} type="hidden" name="kidIds" value={id} />
      ))}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={pending || selectedKidIds.length === 0}
          className="shadow-[2px_2px_0_0_var(--color-border)]"
        >
          {pending ? 'Đang giao bài...' : 'Giao bài'}
        </Button>
      </div>
    </form>
  );
}
