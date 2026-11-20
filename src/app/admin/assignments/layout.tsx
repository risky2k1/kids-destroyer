import { requirePermission } from '@/core/auth/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePermission('assignments.manage');
  return children;
}
