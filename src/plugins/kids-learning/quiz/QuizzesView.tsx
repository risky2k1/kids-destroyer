import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { buttonVariants } from '@/themes/neobrutal/ui/button';
import { QuizzesTable } from './components/QuizzesTable';
import { areaPaths, type Area } from './lib/area';
import { listQuizzes } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function QuizzesView({
  area = 'admin',
  origin,
}: {
  area?: Area;
  origin?: 'system' | 'parent';
}) {
  const quizzes = await listQuizzes();
  const paths = areaPaths(area);
  const tab: 'system' | 'parent' = origin === 'parent' ? 'parent' : 'system';
  const rows = area === 'parent' ? quizzes.filter((quiz) => quiz.origin === tab) : quizzes;
  const showAi = area === 'parent' && Boolean(process.env.GEMINI_API_KEY);
  return (
    <>
      <PageHeader
        icon={ClipboardList}
        title="Đề"
        actions={
          <span className="flex items-center gap-2">
            {showAi ? (
              <Link
                href={PATHS.parent.aiQuiz}
                className={buttonVariants({
                  size: 'sm',
                  variant: 'neutral',
                  className: `h-7 border-2 ${hardShadow}`,
                })}
              >
                Tạo đề bằng AI
              </Link>
            ) : null}
            <Link
              href={paths.newQuiz}
              className={buttonVariants({ size: 'sm', className: `h-7 border-2 ${hardShadow}` })}
            >
              + Tạo
            </Link>
          </span>
        }
      />
      {area === 'parent' ? (
        <nav className="flex gap-2 px-4 pt-4">
          <Link
            href={`${paths.quizzes}?origin=system`}
            className={buttonVariants({
              size: 'sm',
              variant: tab === 'system' ? 'default' : 'neutral',
              className: `h-7 border-2 ${hardShadow}`,
            })}
          >
            Đề hệ thống
          </Link>
          <Link
            href={`${paths.quizzes}?origin=parent`}
            className={buttonVariants({
              size: 'sm',
              variant: tab === 'parent' ? 'default' : 'neutral',
              className: `h-7 border-2 ${hardShadow}`,
            })}
          >
            Đề phụ huynh
          </Link>
        </nav>
      ) : null}
      <QuizzesTable rows={rows} area={area} />
    </>
  );
}
