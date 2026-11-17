import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PATHS } from '@/core/routes';
import { getCurrentKid } from '@/packages/family';

export default async function KidLayout({ children }: { children: React.ReactNode }) {
  const kid = await getCurrentKid();
  // Invalid/expired/foreign kid session: stay locked; only the parent password (exit page) leaves kid mode.
  if (!kid) redirect(PATHS.kid.exit);
  return (
    <>
      <header className="border-border bg-secondary-background flex items-center gap-3 border-b-2 p-3">
        <span className="text-4xl">{kid.avatar}</span>
        <span className="text-xl font-bold">{kid.displayName}</span>
        <Link href={PATHS.kid.exit} className="ml-auto text-sm underline">
          Thoát
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
    </>
  );
}
