import { requireArea } from '@/core/auth/session';
import { AdminShell } from '@/app/_chrome/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireArea('admin');
  return <AdminShell userName={user.displayName}>{children}</AdminShell>;
}
