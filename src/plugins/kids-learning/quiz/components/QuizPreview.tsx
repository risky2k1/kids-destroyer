'use client';

import { useEffect, useState, type ComponentType, type ReactElement } from 'react';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { loadQuizPreview } from '../previewAction';

type Preview = NonNullable<Awaited<ReturnType<typeof loadQuizPreview>>>;

function mcqAnswer(content: unknown, answer: unknown): string | null {
  if (!content || !answer || typeof content !== 'object' || typeof answer !== 'object') return null;
  if (!('options' in content) || !Array.isArray(content.options)) return null;
  if (!('correct' in answer) || !Array.isArray(answer.correct)) return null;
  const options: unknown[] = content.options;
  const text = answer.correct
    .filter((index): index is number => typeof index === 'number')
    .map((index) => options[index])
    .filter((option) => typeof option === 'string' && option.length > 0);
  return text.length > 0 ? `Đáp án: ${text.join(', ')}` : null;
}

export function QuizPreview({ quizId, trigger }: { quizId: string; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState<Preview | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadQuizPreview(quizId).then((data) => {
      if (!cancelled) setQuiz(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, quizId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{quiz?.title ?? 'Xem trước'}</DialogTitle>
        </DialogHeader>
        {quiz ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground/70">
              {quiz.subjectName} · {quiz.gradeName} · {quiz.items.length} câu
            </p>
            <ol className="flex flex-col gap-4">
              {quiz.items.map((item, index) => {
                const plugin = getPlugin(item.type);
                const content = plugin?.contentSchema.safeParse(item.content);
                const answer = plugin?.answerSchema.safeParse(item.answer);
                const playable = Boolean(plugin && content?.success && answer?.success);
                const Player = plugin?.Player as
                  | ComponentType<{
                      content: unknown;
                      value: undefined;
                      onChange: () => void;
                      disabled?: boolean;
                    }>
                  | undefined;
                const Review = plugin?.Review as
                  | ComponentType<{
                      content: unknown;
                      answer: unknown;
                      response: undefined;
                      result: undefined;
                    }>
                  | undefined;
                const mcq =
                  item.type === 'mcq' && content?.success && answer?.success
                    ? mcqAnswer(content.data, answer.data)
                    : null;
                return (
                  <li
                    key={item.questionId}
                    className="flex flex-col gap-2 border-b border-border/20 pb-3"
                  >
                    <p className="text-sm font-heading">
                      {index + 1}. {item.prompt}
                    </p>
                    {item.imageUrl ? (
                      // Storage host is not configured for next/image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="max-h-60 object-contain" />
                    ) : null}
                    {playable && Player ? (
                      <Player
                        content={content?.success ? content.data : item.content}
                        value={undefined}
                        onChange={() => {}}
                        disabled
                      />
                    ) : null}
                    {playable && Review ? (
                      <Review
                        content={content?.success ? content.data : item.content}
                        answer={answer?.success ? answer.data : item.answer}
                        response={undefined}
                        result={undefined}
                      />
                    ) : null}
                    {mcq ? <p className="text-sm">{mcq}</p> : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-foreground/60">Đang tải…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
