import { requireArea } from '@/core/auth/session';
import { AdminShell } from '@/app/_chrome/AdminShell';
import { getSettings } from '@/packages/settings';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('admin');
  const { siteName } = await getSettings();
  return (
    <AdminShell userName={user.displayName} siteName={siteName}>
      {children}
    </AdminShell>
  );
}
