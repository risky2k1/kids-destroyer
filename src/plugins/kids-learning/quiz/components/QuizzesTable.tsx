'use client';

import Link from 'next/link';
import { Eye, BookOpen, GraduationCap, Hash, Sigma, Text } from 'lucide-react';
import { RecordTable } from '@/core/ui/RecordTable';
import { Button } from '@/themes/neobrutal/ui/button';
import { areaPaths, type Area } from '../lib/area';
import { QuizPreview } from './QuizPreview';

type Row = {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  questionCount: number;
  totalPoints: number;
};

export function QuizzesTable({ rows, area = 'admin' }: { rows: Row[]; area?: Area }) {
  const paths = areaPaths(area);
  return (
    <RecordTable
      view={{ label: 'đề' }}
      columns={[
        {
          key: 'title',
          label: 'Tên',
          icon: Text,
          sortValue: (row) => row.title,
          filterValue: (row) => row.title,
          render: (row) => <span className="font-heading">{row.title}</span>,
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
          key: 'count',
          label: 'Số câu',
          icon: Hash,
          sortValue: (row) => row.questionCount,
          render: (row) => row.questionCount,
        },
        {
          key: 'points',
          label: 'Tổng điểm',
          icon: Sigma,
          sortValue: (row) => row.totalPoints,
          render: (row) => row.totalPoints,
        },
        {
          key: 'preview',
          label: '',
          icon: Eye,
          render: (row) => (
            <span
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <QuizPreview
                quizId={row.id}
                trigger={
                  <Button type="button" variant="neutral" size="xs" className="h-7">
                    Xem trước
                  </Button>
                }
              />
            </span>
          ),
        },
      ]}
      rows={rows}
      getId={(row) => row.id}
      getHref={(row) => paths.quiz(row.id)}
      empty="Chưa có đề nào."
      addRow={
        <Link href={paths.newQuiz} className="text-[13px] text-foreground/60">
          + Thêm mới
        </Link>
      }
    />
  );
}
