import { requireArea } from '@/core/auth/session';
import { AdminShell } from '@/app/_chrome/AdminShell';
import { getSettings } from '@/packages/settings';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('admin');
  const { siteName, logoUrl } = await getSettings();
  return (
    <AdminShell
      userName={user.displayName}
      siteName={siteName}
      logoUrl={logoUrl}
      principal={{ roleId: user.roleId, permissions: user.permissions, familyId: user.familyId }}
      roleName={user.roleName}
    >
      {children}
    </AdminShell>
  );
}
