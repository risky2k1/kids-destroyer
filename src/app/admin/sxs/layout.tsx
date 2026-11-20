import type { ReactNode } from 'react';
import { requirePermission } from '@/core/auth/session';
import { requireModule } from '@/core/modules/server';

export default async function Layout({ children }: { children: ReactNode }) {
  await requireModule('sword-x-staff');
  await requirePermission('sxs.use');
  return children;
}
