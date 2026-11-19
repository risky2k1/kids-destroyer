import { Send } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { ViewBar } from '@/core/ui/ViewBar';
import { AssignForm } from './components/AssignForm';
import { AssignmentsTable } from './components/AssignmentsTable';
import { listAssignableKids, listAssignments, listQuizOptions } from './queries';

export async function AssignmentsView({ basePath }: { basePath: 'admin' | 'parent' }) {
  const [assignments, kids, quizzes] = await Promise.all([
    listAssignments(),
    listAssignableKids(),
    listQuizOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {basePath === 'admin' ? (
        <>
          <PageHeader icon={Send} title="Giao bài" />
          <AssignForm quizzes={quizzes} kids={kids} />
          <div className="flex flex-col gap-2">
            <ViewBar label="bài đã giao" count={assignments.length} />
            <AssignmentsTable rows={assignments} basePath={basePath} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-heading">Giao bài</h2>
            <AssignForm quizzes={quizzes} kids={kids} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-heading">Bài đã giao</h2>
            <AssignmentsTable rows={assignments} basePath={basePath} />
          </div>
        </>
      )}
    </div>
  );
}
