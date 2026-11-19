'use client';

import { Award, Calendar, ClipboardList, Clock, User } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { RecordTable } from '@/core/ui/RecordTable';
import { Badge } from '@/themes/neobrutal/ui/badge';
import type { AssignmentSummary } from '../queries';

const STATUS_LABELS: Record<AssignmentSummary['status'], string> = {
  assigned: 'Chưa làm',
  submitted: 'Chờ chấm',
  reviewed: 'Đã xong',
};

export function AssignmentsTable({
  rows,
  basePath,
}: {
  rows: AssignmentSummary[];
  basePath: 'admin' | 'parent';
}) {
  return (
    <RecordTable
      columns={[
        {
          key: 'kid',
          label: 'Bé',
          icon: User,
          render: (row) => (
            <span className="inline-flex items-center gap-1.5 font-heading">
              <span className="text-base">{row.kidAvatar}</span>
              <span>{row.kidName}</span>
            </span>
          ),
        },
        {
          key: 'quiz',
          label: 'Đề',
          icon: ClipboardList,
          render: (row) => <span className="font-heading">{row.quizTitle}</span>,
        },
        {
          key: 'due',
          label: 'Hạn',
          icon: Calendar,
          render: (row) => {
            if (!row.dueAt) return <span className="text-foreground/50">—</span>;
            const dueTime = new Date(row.dueAt).getTime();
            const isOverdue = dueTime < Date.now() && row.status === 'assigned';
            const dateStr = new Date(row.dueAt).toLocaleDateString('vi-VN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <span className="inline-flex items-center gap-1.5">
                <span>{dateStr}</span>
                {isOverdue && (
                  <Badge className="border-destructive/30 bg-destructive/10 px-1 py-0 text-[11px] text-destructive">
                    Quá hạn
                  </Badge>
                )}
              </span>
            );
          },
        },
        {
          key: 'status',
          label: 'Trạng thái',
          icon: Clock,
          render: (row) => (
            <Badge className="px-1.5 py-0 text-xs font-base">
              {STATUS_LABELS[row.status] ?? row.status}
            </Badge>
          ),
        },
        {
          key: 'score',
          label: 'Điểm',
          icon: Award,
          render: (row) => (row.score !== null ? `${row.score}/10` : '—'),
        },
      ]}
      rows={rows}
      getId={(row) => row.id}
      getHref={(row) =>
        basePath === 'admin' ? PATHS.admin.assignment(row.id) : PATHS.parent.assignment(row.id)
      }
      empty="Chưa có bài nào được giao."
    />
  );
}
