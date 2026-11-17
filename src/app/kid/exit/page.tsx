import Link from 'next/link';
import { requireRole } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { ExitForm } from '@/packages/family';

// Outside the (play) layout on purpose: must work even when the kid session is invalid.
export default async function KidExitPage() {
  await requireRole('admin', 'parent');
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 py-10">
      <h1 className="text-center text-2xl">Bố/mẹ nhập mật khẩu để thoát</h1>
      <ExitForm />
      <Link href={PATHS.kid.root} className="text-center underline">
        ← Quay lại làm bài
      </Link>
    </main>
  );
}
