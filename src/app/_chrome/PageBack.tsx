'use client';

import { usePathname } from 'next/navigation';
import { BackLink } from '@/core/ui/BackLink';
import { backTarget } from '@/core/ui/backTarget';

export function PageBack({ canAdmin }: { canAdmin?: boolean }) {
  const target = backTarget(usePathname(), canAdmin);
  if (!target) return null;
  return (
    <div className="mb-4">
      <BackLink href={target.href} label={target.label} />
    </div>
  );
}
