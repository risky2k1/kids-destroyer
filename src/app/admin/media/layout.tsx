import type { ReactNode } from 'react';
import { requireAnyPermission } from '@/core/auth/session';

export default async function MediaLayout({ children }: { children: ReactNode }) {
  await requireAnyPermission(['media.view', 'media.manage']);
  return children;
}
