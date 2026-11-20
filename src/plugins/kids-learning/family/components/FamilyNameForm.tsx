'use client';

import { useEffect, useRef } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { saveFamily } from '../actions';

/** Rename an existing family (with `family`) or create a new one. */
export function FamilyNameForm({
  family,
  onDone,
}: {
  family?: { id: string; name: string };
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionToast(saveFamily, family ? 'Đã lưu' : 'Đã thêm');
  const seen = useRef(state);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex gap-2">
      {family && <input type="hidden" name="id" value={family.id} />}
      <Input
        name="name"
        defaultValue={family?.name}
        placeholder={family ? undefined : 'Tên gia đình mới'}
        aria-label="Tên gia đình"
        className="h-8 min-w-0 flex-1"
        required
      />
      <Button type="submit" size="sm" disabled={pending}>
        {family ? 'Lưu' : 'Thêm'}
      </Button>
    </form>
  );
}
