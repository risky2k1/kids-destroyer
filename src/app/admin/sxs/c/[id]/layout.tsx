import type { ReactNode } from 'react';
import { StudioShell } from '@/plugins/sword-x-staff/characters';
import { loadStudio } from '@/plugins/sword-x-staff/studio/server';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studio = await loadStudio(id);
  return <StudioShell studio={studio}>{children}</StudioShell>;
}
