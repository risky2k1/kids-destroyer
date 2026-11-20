import { requireArea } from '@/core/auth/session';
import { disabledModules } from '@/core/modules/server';
import { AdminShell } from '@/app/_chrome/AdminShell';
import { getSettings } from '@/packages/settings';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('admin');
  const [{ siteName, logoUrl }, disabledIds] = await Promise.all([
    getSettings(),
    disabledModules(),
  ]);
  return (
    <AdminShell
      userName={user.displayName}
      siteName={siteName}
      logoUrl={logoUrl}
      principal={{ roleId: user.roleId, permissions: user.permissions, familyId: user.familyId }}
      roleName={user.roleName}
      disabledIds={disabledIds}
    >
      {children}
    </AdminShell>
  );
}
