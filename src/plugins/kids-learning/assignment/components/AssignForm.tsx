'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { DateTimePicker } from '@/themes/neobrutal/ui/date-time-picker';
import { Label } from '@/themes/neobrutal/ui/label';
import { MultiSelect } from '@/themes/neobrutal/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/themes/neobrutal/ui/select';
import { QuizPreview } from '@/plugins/kids-learning/quiz';
import { assign } from '../actions';
import type { AssignableKid, QuizOption } from '../queries';

export function AssignForm({ quizzes, kids }: { quizzes: QuizOption[]; kids: AssignableKid[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [quizId, setQuizId] = useState('');
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

  const kidOptions = useMemo(
    () =>
      kids.map((k) => ({
        value: k.id,
        label: k.name,
        description: k.familyName ?? undefined,
        prefix: <span>{k.avatar}</span>,
      })),
    [kids],
  );

  const selectedQuiz = quizzes.find((q) => q.id === quizId);

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => {
        setQuizId('');
        setSelectedKidIds([]);
      }}
      className="flex flex-col gap-4 rounded-base border-2 border-border bg-main/5 p-4 shadow-[2px_2px_0_0_var(--color-border)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quizId" className="font-heading text-sm">
            Đề bài
          </Label>
          <input type="hidden" name="quizId" value={quizId} required />
          <div className="flex items-center gap-2">
            <Select value={quizId} onValueChange={(v) => setQuizId(v ?? '')}>
              <SelectTrigger id="quizId" className="h-9 bg-secondary-background text-foreground">
                <SelectValue>
                  {selectedQuiz
                    ? `${selectedQuiz.title} (${selectedQuiz.questionCount} câu)`
                    : '-- Chọn đề --'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Đề hệ thống</SelectLabel>
                  {quizzes
                    .filter((quiz) => quiz.origin !== 'parent')
                    .map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.questionCount} câu)
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Đề phụ huynh</SelectLabel>
                  {quizzes
                    .filter((quiz) => quiz.origin === 'parent')
                    .map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.questionCount} câu)
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {quizId ? (
              <QuizPreview
                quizId={quizId}
                trigger={
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon"
                    aria-label="Xem trước"
                    className="size-9 shrink-0"
                  >
                    <Eye />
                  </Button>
                }
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueAt" className="font-heading text-sm">
            Hạn nộp (tùy chọn)
          </Label>
          <DateTimePicker
            id="dueAt"
            name="dueAt"
            placeholder="Không giới hạn…"
            triggerClassName="h-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-heading text-sm">Bé làm bài</Label>
        {kids.length === 0 ? (
          <p className="text-xs text-foreground/60">Chưa có bé nào để giao bài.</p>
        ) : (
          <MultiSelect
            options={kidOptions}
            value={selectedKidIds}
            onChange={setSelectedKidIds}
            placeholder="Chọn bé để giao bài…"
            searchPlaceholder="Tìm theo tên bé hoặc gia đình…"
            emptyText="Không tìm thấy bé nào."
            itemLabel="bé"
          />
        )}
      </div>

      {selectedKidIds.map((id) => (
        <input key={id} type="hidden" name="kidIds" value={id} />
      ))}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={pending || !quizId || selectedKidIds.length === 0}
          className="shadow-[2px_2px_0_0_var(--color-border)]"
        >
          {pending ? 'Đang giao bài...' : 'Giao bài'}
        </Button>
      </div>
    </form>
  );
}
