import { canEnter } from '@/core/acl/access';
import { requireArea } from '@/core/auth/session';
import { requireModule } from '@/core/modules/server';
import { PATHS } from '@/core/routes';
import { AppHeader } from '@/app/_chrome/AppHeader';
import { PageBack } from '@/app/_chrome/PageBack';
import { getSettings } from '@/packages/settings';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireModule('kids-learning');
  const user = await requireArea('parent');
  const { siteName, logoUrl } = await getSettings();
  const canAdmin = canEnter('admin', user);
  const nav = canAdmin ? [{ href: PATHS.admin.root, label: 'Quản trị' }] : [];
  return (
    <>
      <AppHeader
        title="Phụ huynh"
        nav={nav}
        userName={user.displayName}
        logoUrl={logoUrl}
        siteName={siteName}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <PageBack canAdmin={canAdmin} />
        {children}
      </main>
    </>
  );
}
