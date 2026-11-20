import { requireUser } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { BackLink } from '@/core/ui/BackLink';
import { ExitForm } from '@/plugins/kids-learning/family';

// Outside the (play) layout on purpose: must work even when the kid session is invalid.
export default async function KidExitPage() {
  await requireUser();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 py-10">
      <BackLink href={PATHS.kid.root} label="Làm bài" />
      <h1 className="text-center text-2xl">Bố/mẹ nhập mật khẩu để thoát</h1>
      <ExitForm />
    </main>
  );
}
