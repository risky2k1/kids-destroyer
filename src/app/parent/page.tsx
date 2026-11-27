import { Suspense } from 'react';
import Link from 'next/link';
import { canEnter } from '@/core/acl/access';
import { getCurrentUser } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { AssignmentsPageSkeleton } from '@/core/ui/PageSkeletons';
import { AssignmentsView } from '@/plugins/kids-learning/assignment';
import { Button } from '@/themes/neobrutal/ui/button';

export default async function ParentHome() {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Xin chào {user?.displayName}</h1>
      {user && canEnter('kid', user) && (
        <Button
          render={<Link href={PATHS.parent.kidMode} />}
          nativeButton={false}
          size="lg"
          className="self-start"
        >
          Cho bé làm bài
        </Button>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link href={PATHS.parent.quizzes} />}
          nativeButton={false}
          size="lg"
          variant="neutral"
          className="self-start"
        >
          Kho đề
        </Button>
        {process.env.GEMINI_API_KEY ? (
          <Button
            render={<Link href={PATHS.parent.aiQuiz} />}
            nativeButton={false}
            size="lg"
            variant="neutral"
            className="self-start"
          >
            Tạo đề bằng AI
          </Button>
        ) : null}
      </div>
      <Suspense fallback={<AssignmentsPageSkeleton />}>
        <AssignmentsView basePath="parent" />
      </Suspense>
    </div>
  );
}
