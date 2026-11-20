import type { ReactNode } from 'react';
import { requirePermission } from '@/core/auth/session';

export default async function Layout({ children }: { children: ReactNode }) {
  await requirePermission('modules.manage');
  return children;
}
