'use client';

import { useState } from 'react';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { useActionToast } from '@/core/ui/useActionToast';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { deleteAssignment, saveReview } from '../actions';
import { itemScore } from '../lib/scoring';
import type { AssignmentResultDetail } from '../queries';

export function ReviewForm({
  assignment,
  basePath,
}: {
  assignment: AssignmentResultDetail;
  basePath: 'admin' | 'parent';
}) {
  const [comment, setComment] = useState(assignment.parentComment ?? '');
  const [manualScores, setManualScores] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const item of assignment.items) {
      if (item.needsManual && item.manualScore !== null && item.manualScore !== undefined) {
        init[item.questionId] = String(Math.round(item.manualScore * 100));
      }
    }
    return init;
  });
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const item of assignment.items) {
      if (item.feedback) {
        init[item.questionId] = item.feedback;
      }
    }
    return init;
  });

  const [, formAction, pending] = useActionToast(saveReview, 'Đã lưu');
  const [, deleteAction, deleting] = useActionToast(deleteAssignment, 'Đã xóa bài');

  const itemsPayload = assignment.items
    .filter((item) => item.needsManual && item.r1ResponseId)
    .map((item) => {
      const raw = manualScores[item.questionId];
      const parsed = raw !== undefined && raw !== '' ? Number(raw) / 100 : null;
      return {
        responseId: item.r1ResponseId!,
        manual: parsed !== null && !Number.isNaN(parsed) ? Math.min(1, Math.max(0, parsed)) : null,
        feedback: feedbacks[item.questionId]?.trim() || null,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {assignment.items.map((item, index) => {
          const plugin = getPlugin(item.type);
          const PluginReview = plugin?.Review;
          const scoreVal = itemScore({
            questionId: item.questionId,
            points: item.points,
            needsManual: item.needsManual,
            r1: item.r1Score,
            r2: item.r2Score,
            manual:
              manualScores[item.questionId] !== undefined && manualScores[item.questionId] !== ''
                ? Number(manualScores[item.questionId]) / 100
                : item.manualScore,
          });

          return (
            <div
              key={item.questionId}
              className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-4 shadow-[2px_2px_0_0_var(--color-border)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/10 pb-2">
                <span className="font-heading text-sm">
                  Câu {index + 1} · {item.points} điểm
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.r1Score !== undefined && (
                    <Badge className="px-1.5 py-0 text-xs">
                      Vòng 1:{' '}
                      {item.r1Score === 1
                        ? 'Đúng'
                        : item.r1Score === 0
                          ? 'Sai'
                          : `${Math.round(item.r1Score * 100)}%`}
                    </Badge>
                  )}
                  {item.r2Score !== undefined && (
                    <Badge className="px-1.5 py-0 text-xs">
                      Vòng 2:{' '}
                      {item.r2Score === 1
                        ? 'Đúng'
                        : item.r2Score === 0
                          ? 'Sai'
                          : `${Math.round(item.r2Score * 100)}%`}
                    </Badge>
                  )}
                  {item.needsManual && (
                    <Badge className="border-chart-4/30 bg-chart-4/10 px-1.5 py-0 text-xs text-foreground">
                      Chấm tay
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm font-base">{item.prompt}</p>

              {PluginReview && (
                <div className="rounded-base border border-border/10 bg-secondary-background p-3">
                  <PluginReview
                    content={item.content as never}
                    answer={item.answer as never}
                    response={item.bestResponse as never}
                    result={{
                      score: scoreVal,
                      needsManual: item.needsManual,
                    }}
                  />
                </div>
              )}

              {item.needsManual && (
                <div className="mt-2 flex flex-col gap-2 rounded-base border border-border/20 bg-main/5 p-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`score-${item.questionId}`} className="font-heading text-xs">
                      Điểm (0–100%):
                    </Label>
                    <Input
                      id={`score-${item.questionId}`}
                      type="number"
                      min={0}
                      max={100}
                      value={manualScores[item.questionId] ?? ''}
                      onChange={(e) =>
                        setManualScores((prev) => ({
                          ...prev,
                          [item.questionId]: e.target.value,
                        }))
                      }
                      placeholder="0-100"
                      className="h-8 w-24 text-center font-heading"
                    />
                  </div>
                  <Input
                    value={feedbacks[item.questionId] ?? ''}
                    onChange={(e) =>
                      setFeedbacks((prev) => ({
                        ...prev,
                        [item.questionId]: e.target.value,
                      }))
                    }
                    placeholder="Nhận xét riêng cho câu này (tối đa 500 ký tự)..."
                    maxLength={500}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-4 shadow-[2px_2px_0_0_var(--color-border)]"
      >
        <input type="hidden" name="assignmentId" value={assignment.id} />
        <input type="hidden" name="items" value={JSON.stringify(itemsPayload)} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="comment" className="font-heading text-sm">
            Nhận xét chung
          </Label>
          <Textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét bài làm của bé (tối đa 1000 ký tự)..."
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {assignment.canDelete ? (
            <Button
              type="button"
              variant="neutral"
              disabled={deleting}
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa bài này?')) {
                  const fd = new FormData();
                  fd.set('id', assignment.id);
                  fd.set('basePath', basePath);
                  deleteAction(fd);
                }
              }}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {deleting ? 'Đang xóa...' : 'Xóa bài'}
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={pending}
            className="shadow-[2px_2px_0_0_var(--color-border)]"
          >
            {pending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
