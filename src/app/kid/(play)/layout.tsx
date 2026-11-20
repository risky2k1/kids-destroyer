import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/app/_chrome/AppHeader';
import { PATHS } from '@/core/routes';
import { getSettings } from '@/packages/settings';
import { getCurrentKid } from '@/plugins/kids-learning/family';

export default async function KidLayout({ children }: { children: React.ReactNode }) {
  const kid = await getCurrentKid();
  // Invalid/expired/foreign kid session: stay locked; only the parent password (exit page) leaves kid mode.
  if (!kid) redirect(PATHS.kid.exit);
  const { siteName, logoUrl } = await getSettings();
  return (
    <>
      <AppHeader
        title={
          <span className="flex items-center gap-2">
            <span className="text-4xl leading-none">{kid.avatar}</span>
            <span className="text-xl font-bold">{kid.displayName}</span>
          </span>
        }
        logoUrl={logoUrl}
        siteName={siteName}
        right={
          <Link href={PATHS.kid.exit} className="text-sm underline">
            Thoát
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
    </>
  );
}
