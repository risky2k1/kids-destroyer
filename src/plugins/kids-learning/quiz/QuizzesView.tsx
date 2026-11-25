import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { buttonVariants } from '@/themes/neobrutal/ui/button';
import { QuizzesTable } from './components/QuizzesTable';
import { listQuizzes } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function QuizzesView() {
  const quizzes = await listQuizzes();
  return (
    <>
      <PageHeader
        icon={ClipboardList}
        title="Đề"
        actions={
          <Link
            href={PATHS.admin.newQuiz}
            className={buttonVariants({ size: 'sm', className: `h-7 border-2 ${hardShadow}` })}
          >
            + Tạo
          </Link>
        }
      />
      <QuizzesTable rows={quizzes} />
    </>
  );
}
