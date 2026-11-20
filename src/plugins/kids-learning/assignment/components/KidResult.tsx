'use client';

import Link from 'next/link';
import { PATHS } from '@/core/routes';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import type { KidQuestion } from '../kidQueries';

export function KidResult({
  quizTitle,
  score,
  results,
  questions,
  comment,
  reveal,
}: {
  quizTitle: string;
  score: number | null;
  results: {
    questionId: string;
    r1?: number;
    r2?: number;
    needsManual: boolean;
  }[];
  questions: KidQuestion[];
  comment: string | null;
  reveal: null | {
    answers: Record<string, unknown>;
    responses: Record<string, unknown>;
  };
}) {
  const resultMap = new Map(results.map((r) => [r.questionId, r]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-base border-2 border-border bg-main/20 p-6 text-center shadow-[3px_3px_0_0_var(--color-border)]">
        <h1 className="text-2xl font-black">{quizTitle}</h1>
        <p className="text-lg font-bold text-foreground/80">Kết quả bài làm</p>
        <div className="text-6xl font-black text-main-foreground">
          {score !== null ? `${score}/10` : '—'}
        </div>
        {comment && (
          <div className="mt-2 w-full rounded-base border-2 border-border bg-background p-4 text-left">
            <span className="font-heading text-base font-bold">Lời nhắn từ ba mẹ:</span>
            <p className="mt-1 text-lg italic text-foreground">{comment}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Chi tiết từng câu</h2>
        {questions.map((question, index) => {
          const res = resultMap.get(question.id);
          // Heterogeneous plugin component typing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plugin = getPlugin(question.type) as any;
          const PluginReview = plugin?.Review;

          let statusBadge = '❌ Chưa làm';
          if (res?.needsManual) {
            statusBadge = '⏳ Chờ ba mẹ chấm';
          } else if (res?.r2 !== undefined) {
            const best = Math.max(res.r1 ?? 0, res.r2);
            statusBadge = best === 1 ? '✅ Đúng' : '❌ Sai';
          } else if (res?.r1 !== undefined) {
            statusBadge = res.r1 === 1 ? '✅ Đúng' : '❌ Sai';
          }

          const itemScoreVal =
            res?.r2 !== undefined ? Math.max(res.r1 ?? 0, res.r2) : (res?.r1 ?? 0);

          return (
            <div
              key={question.id}
              className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-5 shadow-[2px_2px_0_0_var(--color-border)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-2">
                <span className="font-heading text-lg font-bold">
                  Câu {index + 1} · {question.points} điểm
                </span>
                <div className="flex items-center gap-2">
                  {res?.r1 !== undefined && res?.r2 !== undefined && (
                    <span className="text-sm text-foreground/70">
                      (V1: {res.r1 === 1 ? 'Đúng' : 'Sai'}, V2: {res.r2 === 1 ? 'Đúng' : 'Sai'})
                    </span>
                  )}
                  <Badge className="px-2.5 py-1 text-base font-bold">{statusBadge}</Badge>
                </div>
              </div>

              <p className="text-lg font-bold">{question.prompt}</p>

              {reveal && PluginReview && (
                <div className="rounded-base border border-border/40 bg-secondary-background/50 p-3 text-base">
                  <PluginReview
                    content={question.content}
                    answer={reveal.answers[question.id]}
                    response={reveal.responses[question.id]}
                    result={{
                      score: itemScoreVal,
                      needsManual: res?.needsManual ?? false,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button
          render={<Link href={PATHS.kid.root} />}
          nativeButton={false}
          className="h-16 w-full text-xl font-bold"
        >
          Về trang bài tập
        </Button>
      </div>
    </div>
  );
}
