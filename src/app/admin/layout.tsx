import { requireArea } from '@/core/auth/session';
import { PATHS } from '@/core/routes';
import { AppHeader } from '@/app/_chrome/AppHeader';

const NAV = [
  { href: PATHS.admin.catalog, label: 'Danh mục' },
  { href: PATHS.admin.families, label: 'Gia đình' },
  { href: PATHS.parent.root, label: 'Khu phụ huynh' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('admin');
  return (
    <>
      <AppHeader title="Quản trị" nav={NAV} userName={user.displayName} />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
    </>
  );
}
