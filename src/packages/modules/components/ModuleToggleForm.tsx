'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { setModuleEnabled } from '../actions';

export function ModuleToggleForm({ id, enabled }: { id: string; enabled: boolean }) {
  const [, formAction, pending] = useActionToast(
    setModuleEnabled,
    enabled ? 'Đã tắt plugin' : 'Đã bật plugin',
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="enabled" value={enabled ? 'false' : 'true'} />
      <Button type="submit" size="sm" variant={enabled ? 'neutral' : 'default'} disabled={pending}>
        {enabled ? 'Tắt' : 'Bật'}
      </Button>
    </form>
  );
}
