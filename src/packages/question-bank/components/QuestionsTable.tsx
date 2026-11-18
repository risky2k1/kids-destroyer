'use client';

import Link from 'next/link';
import { BookOpen, Calendar, GraduationCap, Shapes, Tags, Text } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { Chips, RecordTable } from '@/core/ui/RecordTable';
import type { QuestionSummary } from '../lib/questionRow';

const when = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export function QuestionsTable({ rows }: { rows: QuestionSummary[] }) {
  return (
    <RecordTable
      columns={[
        {
          key: 'prompt',
          label: 'Câu',
          icon: Text,
          className: 'max-w-md',
          render: (row) => (
            <span className="block max-w-md truncate font-heading" title={row.prompt}>
              {row.prompt}
            </span>
          ),
        },
        {
          key: 'type',
          label: 'Dạng',
          icon: Shapes,
          render: (row) => <Chips items={[row.typeName]} />,
        },
        {
          key: 'subject',
          label: 'Môn',
          icon: BookOpen,
          render: (row) => row.subjectName,
        },
        {
          key: 'grade',
          label: 'Lớp',
          icon: GraduationCap,
          render: (row) => row.gradeName,
        },
        {
          key: 'topic',
          label: 'Chủ đề',
          icon: Tags,
          render: (row) => row.topicName,
        },
        {
          key: 'created',
          label: 'Tạo lúc',
          icon: Calendar,
          render: (row) => when.format(new Date(row.createdAt)),
        },
      ]}
      rows={rows}
      getId={(row) => row.id}
      getHref={(row) => PATHS.admin.question(row.id)}
      empty="Chưa có câu nào."
      addRow={
        <Link href={PATHS.admin.newQuestion} className="text-[13px] text-foreground/60">
          + Thêm mới
        </Link>
      }
    />
  );
}
