'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Hash, Sigma, Text } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { RecordTable } from '@/core/ui/RecordTable';

type Row = {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  questionCount: number;
  totalPoints: number;
};

export function QuizzesTable({ rows }: { rows: Row[] }) {
  return (
    <RecordTable
      columns={[
        {
          key: 'title',
          label: 'Tên',
          icon: Text,
          render: (row) => <span className="font-heading">{row.title}</span>,
        },
        { key: 'subject', label: 'Môn', icon: BookOpen, render: (row) => row.subjectName },
        { key: 'grade', label: 'Lớp', icon: GraduationCap, render: (row) => row.gradeName },
        { key: 'count', label: 'Số câu', icon: Hash, render: (row) => row.questionCount },
        { key: 'points', label: 'Tổng điểm', icon: Sigma, render: (row) => row.totalPoints },
      ]}
      rows={rows}
      getId={(row) => row.id}
      getHref={(row) => PATHS.admin.quiz(row.id)}
      empty="Chưa có đề nào."
      addRow={
        <Link href={PATHS.admin.newQuiz} className="text-[13px] text-foreground/60">
          + Thêm mới
        </Link>
      }
    />
  );
}
