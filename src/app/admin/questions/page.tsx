import { Suspense } from 'react';
import Link from 'next/link';
import { CircleHelp } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { TableSkeleton } from '@/core/ui/PageSkeletons';
import { QuestionsView } from '@/plugins/kids-learning/question-bank/server';
import { buttonVariants } from '@/themes/neobrutal/ui/button';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string | string[];
    grade?: string | string[];
    type?: string | string[];
  }>;
}) {
  const params = await searchParams;
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            icon={CircleHelp}
            title="Câu hỏi"
            actions={
              <Link
                href={PATHS.admin.newQuestion}
                className={buttonVariants({ size: 'sm', className: `h-7 border-2 ${hardShadow}` })}
              >
                + Tạo
              </Link>
            }
          />
          <TableSkeleton columns={6} rows={8} withHeader={false} />
        </>
      }
    >
      <QuestionsView
        subject={first(params.subject)}
        grade={first(params.grade)}
        type={first(params.type)}
      />
    </Suspense>
  );
}
