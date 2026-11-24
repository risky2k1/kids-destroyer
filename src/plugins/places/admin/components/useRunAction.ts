'use client';

import { useTransition } from 'react';
import type { ActionState } from '@/core/actions';
import { toast } from '@/themes/neobrutal/ui/toast';

/** Run a non-form server action in a transition and toast its result. */
export function useRunAction() {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionState>, successMessage?: string) =>
    start(async () => {
      const result = await fn();
      if (result.error) toast.add({ title: result.error, type: 'error' });
      else if (successMessage) toast.add({ title: successMessage, type: 'success' });
    });
  return [pending, run] as const;
}
