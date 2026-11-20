import { canEnter } from '@/core/acl/access';
import { requireArea } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { AppHeader } from '@/app/_chrome/AppHeader';
import { PageBack } from '@/app/_chrome/PageBack';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('parent');
  const canAdmin = canEnter('admin', user);
  const nav = canAdmin ? [{ href: PATHS.admin.root, label: 'Quản trị' }] : [];
  return (
    <>
      <AppHeader title="Phụ huynh" nav={nav} userName={user.displayName} />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <PageBack canAdmin={canAdmin} />
        {children}
      </main>
    </>
  );
}
