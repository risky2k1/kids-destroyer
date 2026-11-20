import { notFound } from 'next/navigation';
import { Award, Calendar, ClipboardList, Clock } from 'lucide-react';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { ReviewForm } from './components/ReviewForm';
import { getAssignmentResult } from './queries';

const STATUS_LABELS = {
  assigned: 'Chưa làm',
  submitted: 'Chờ chấm',
  reviewed: 'Đã xong',
} as const;

export async function AssignmentResultView({
  id,
  basePath,
}: {
  id: string;
  basePath: 'admin' | 'parent';
}) {
  const assignment = await getAssignmentResult(id);
  if (!assignment) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-main/10 p-4 shadow-[2px_2px_0_0_var(--color-border)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{assignment.kid.avatar}</span>
            <span className="text-xl font-heading">{assignment.kid.displayName}</span>
            <Badge className="ml-2 px-2 py-0.5 text-xs font-base">
              {STATUS_LABELS[assignment.status] ?? assignment.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/70">
            <span className="inline-flex items-center gap-1">
              <ClipboardList className="size-3.5" />
              <span>{assignment.quiz.title}</span>
            </span>
            {assignment.dueAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                <span>
                  Hạn:{' '}
                  {new Date(assignment.dueAt).toLocaleDateString('vi-VN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>
                Giao:{' '}
                {new Date(assignment.createdAt).toLocaleDateString('vi-VN', {
                  month: 'numeric',
                  day: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-base border-2 border-border bg-background px-4 py-2 shadow-[2px_2px_0_0_var(--color-border)]">
          <Award className="size-5 text-main" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-foreground/60">Điểm số</span>
            <span className="text-2xl font-heading">
              {assignment.score !== null ? `${assignment.score}/10` : '—'}
            </span>
          </div>
        </div>
      </div>

      <ReviewForm assignment={assignment} basePath={basePath} />
    </div>
  );
}
