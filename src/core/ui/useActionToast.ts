'use client';

import { useActionState, useEffect, useRef } from 'react';
import { initialActionState, type ActionState } from '@/core/actions';
import { toast } from '@/themes/neobrutal/ui/toast';

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** useActionState + toast on every result. Returns [state, formAction, pending]. */
export function useActionToast(action: Action, successMessage?: string) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const seen = useRef(state);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast.add({ title: state.error, type: 'error' });
    else if (state.ok && successMessage) toast.add({ title: successMessage, type: 'success' });
  }, [state, successMessage]);
  return [state, formAction, pending] as const;
}
