'use client';

import type { ReactNode } from 'react';
import { Button } from '@/themes/neobrutal/ui/button';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export function FocusButton({ targetId, children }: { targetId: string; children: ReactNode }) {
  return (
    <Button
      type="button"
      size="sm"
      className={`h-7 border-2 ${hardShadow}`}
      onClick={() => document.getElementById(targetId)?.focus()}
    >
      {children}
    </Button>
  );
}
