'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initialActionState } from '@/core/actions';
import { SpeakButton } from '@/core/ui/SpeakButton';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { Button } from '@/themes/neobrutal/ui/button';
import { submitRound, skipRetry } from '../kidActions';
import type { KidQuestion } from '../kidQueries';

function isQuestionAnswered(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return !Number.isNaN(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (Array.isArray(obj.selected)) return obj.selected.length > 0;
    if (Array.isArray(obj.values)) {
      return (
        obj.values.length > 0 &&
        obj.values.every((v) => typeof v === 'string' && v.trim().length > 0)
      );
    }
    if ('value' in obj) {
      return obj.value !== undefined && obj.value !== null && obj.value !== '';
    }
  }
  return true;
}

export function KidPlayer({
  assignmentId,
  quizTitle,
  round,
  questions,
}: {
  assignmentId: string;
  quizTitle: string;
  round: 1 | 2;
  questions: KidQuestion[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  const [state, formAction, isPending] = useActionState(submitRound, initialActionState);
  const [skipState, skipAction, isSkipping] = useActionState(skipRetry, initialActionState);

  useEffect(() => {
    if (state.ok || skipState.ok) {
      router.refresh();
    }
  }, [state.ok, skipState.ok, router]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-2xl font-bold">Không có câu hỏi nào để làm.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  // Heterogeneous plugin component typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugin = getPlugin(currentQuestion?.type ?? '') as any;
  const PluginPlayer = plugin?.Player;

  function handleSubmit() {
    const unansweredCount = questions.filter((q) => !isQuestionAnswered(responses[q.id])).length;
    if (unansweredCount > 0) {
      const ok = window.confirm(
        `Còn ${unansweredCount} câu chưa trả lời. Bé có chắc muốn nộp bài không?`,
      );
      if (!ok) return;
    }

    const fd = new FormData();
    fd.append('assignmentId', assignmentId);
    fd.append('round', String(round));
    fd.append('responses', JSON.stringify(responses));

    startTransition(() => {
      formAction(fd);
    });
  }

  function handleSkip() {
    if (window.confirm('Bé có chắc muốn bỏ qua lần làm lại này không?')) {
      const fd = new FormData();
      fd.append('assignmentId', assignmentId);
      startTransition(() => {
        skipAction(fd);
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black">{quizTitle}</h1>
        {round === 2 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-base border-2 border-border bg-chart-4/20 p-4">
            <div>
              <p className="text-xl font-bold">Làm lại {questions.length} câu sai</p>
              <p className="text-base text-foreground/80">
                Làm đúng sẽ được tính điểm tối đa cho câu đó!
              </p>
            </div>
            <Button
              type="button"
              variant="neutral"
              className="min-h-11 px-5 text-base font-bold"
              disabled={isSkipping || isPending}
              onClick={handleSkip}
            >
              {isSkipping ? 'Đang bỏ qua...' : 'Bỏ qua'}
            </Button>
          </div>
        )}
      </div>

      {(state.error || skipState.error) && (
        <div className="rounded-base border-2 border-red-500 bg-red-100 p-4 text-lg font-bold text-red-700">
          {state.error || skipState.error}
        </div>
      )}

      <div className="flex flex-col gap-5 rounded-base border-2 border-border bg-background p-6 shadow-[3px_3px_0_0_var(--color-border)]">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <span className="font-heading text-xl font-bold">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <span className="text-base font-bold text-foreground/70">
            {currentQuestion.points} điểm
          </span>
        </div>

        <div className="flex items-start gap-3">
          <h2 className="flex-1 text-xl font-bold">{currentQuestion.prompt}</h2>
          <SpeakButton
            key={currentQuestion.id}
            text={currentQuestion.prompt}
            lang={currentQuestion.lang}
          />
        </div>
        {currentQuestion.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentQuestion.imageUrl} alt="" className="max-h-60 object-contain" />
        ) : null}

        <div className="min-h-36 py-2 text-lg">
          {PluginPlayer ? (
            <PluginPlayer
              content={currentQuestion.content}
              value={responses[currentQuestion.id]}
              disabled={isPending || isSkipping}
              onChange={(val: unknown) => {
                setResponses((prev) => ({
                  ...prev,
                  [currentQuestion.id]: val,
                }));
              }}
            />
          ) : (
            <p className="text-lg text-red-500">Dạng câu hỏi chưa được hỗ trợ</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-4">
          {currentIndex > 0 ? (
            <Button
              type="button"
              variant="neutral"
              className="min-h-12 min-w-28 text-lg font-bold"
              disabled={isPending || isSkipping}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Câu trước
            </Button>
          ) : (
            <div />
          )}

          {currentIndex < questions.length - 1 ? (
            <Button
              type="button"
              className="h-16 min-w-36 text-xl font-bold"
              disabled={isPending || isSkipping}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Câu tiếp
            </Button>
          ) : (
            <Button
              type="button"
              className="h-16 min-w-36 text-xl font-bold"
              disabled={isPending || isSkipping}
              onClick={handleSubmit}
            >
              {isPending ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
