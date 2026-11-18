'use client';

import { usePathname } from 'next/navigation';
import type { Role } from '@/core/acl/access';
import { BackLink } from '@/core/ui/BackLink';
import { backTarget } from '@/core/ui/backTarget';

export function PageBack({ role }: { role?: Role }) {
  const target = backTarget(usePathname(), role);
  if (!target) return null;
  return (
    <div className="mb-4">
      <BackLink href={target.href} label={target.label} />
    </div>
  );
}
