'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, GraduationCap, Shapes, Tags, Text } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { Chips, RecordTable } from '@/core/ui/RecordTable';
import type { QuestionSummary } from '../lib/questionRow';

const when = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export function QuestionsTable({ rows, header }: { rows: QuestionSummary[]; header?: ReactNode }) {
  return (
    <RecordTable
      view={{ label: 'câu hỏi', header }}
      columns={[
        {
          key: 'prompt',
          label: 'Câu',
          icon: Text,
          className: 'max-w-md',
          sortValue: (row) => row.prompt,
          filterValue: (row) => row.prompt,
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
          sortValue: (row) => row.typeName,
          filterValue: (row) => row.typeName,
          filterFacet: true,
          render: (row) => <Chips items={[row.typeName]} />,
        },
        {
          key: 'subject',
          label: 'Môn',
          icon: BookOpen,
          sortValue: (row) => row.subjectName,
          filterValue: (row) => row.subjectName,
          filterFacet: true,
          render: (row) => row.subjectName,
        },
        {
          key: 'grade',
          label: 'Lớp',
          icon: GraduationCap,
          sortValue: (row) => row.gradeName,
          filterValue: (row) => row.gradeName,
          filterFacet: true,
          render: (row) => row.gradeName,
        },
        {
          key: 'topic',
          label: 'Chủ đề',
          icon: Tags,
          sortValue: (row) => row.topicName,
          filterValue: (row) => row.topicName,
          filterFacet: true,
          render: (row) => row.topicName,
        },
        {
          key: 'created',
          label: 'Tạo lúc',
          icon: Calendar,
          sortValue: (row) => row.createdAt,
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
