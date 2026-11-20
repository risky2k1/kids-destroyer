import { requirePermission } from '@/core/auth/session';
import { requireModule } from '@/core/modules/server';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireModule('kids-learning');
  await requirePermission('questions.manage');
  return children;
}
