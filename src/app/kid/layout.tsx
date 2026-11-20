import type { ReactNode } from 'react';
import { requireModule } from '@/core/modules/server';

export default async function KidLayout({ children }: { children: ReactNode }) {
  await requireModule('kids-learning');
  return children;
}
