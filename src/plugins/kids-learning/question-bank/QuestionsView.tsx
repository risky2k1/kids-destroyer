import Link from 'next/link';
import { CircleHelp } from 'lucide-react';
import { listCatalog } from '@/plugins/kids-learning/catalog';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { getPlugin, PLUGIN_IDS } from '@/plugins/kids-learning/question-types';
import { buttonVariants } from '@/themes/neobrutal/ui/button';
import { QuestionFilters } from './components/QuestionFilters';
import { QuestionsTable } from './components/QuestionsTable';
import { listQuestions } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function QuestionsView({
  subject,
  grade,
  type,
}: {
  subject: string;
  grade: string;
  type: string;
}) {
  const [questions, catalog] = await Promise.all([
    listQuestions({
      subjectId: subject || undefined,
      gradeId: grade || undefined,
      type: type || undefined,
    }),
    listCatalog(),
  ]);
  const types = PLUGIN_IDS.flatMap((id) => {
    const plugin = getPlugin(id);
    return plugin ? [{ id, name: plugin.name }] : [];
  });
  return (
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
      <QuestionsTable
        rows={questions}
        header={
          <>
            <QuestionFilters
              subjects={catalog.subjects}
              grades={catalog.grades}
              types={types}
              subject={subject}
              grade={grade}
              type={type}
            />
            <span className="text-foreground/60">· {questions.length}</span>
          </>
        }
      />
    </>
  );
}
