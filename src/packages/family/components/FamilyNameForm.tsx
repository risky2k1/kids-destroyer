'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { saveFamily } from '../actions';

/** Rename an existing family (with `family`) or create a new one. */
export function FamilyNameForm({ family }: { family?: { id: string; name: string } }) {
  const [, formAction, pending] = useActionToast(saveFamily, family ? 'Đã lưu' : 'Đã thêm');
  return (
    <form action={formAction} className="flex gap-2">
      {family && <input type="hidden" name="id" value={family.id} />}
      <Input
        name="name"
        defaultValue={family?.name}
        placeholder={family ? undefined : 'Tên gia đình mới'}
        aria-label="Tên gia đình"
        className="min-w-0 flex-1"
        required
      />
      <Button type="submit" disabled={pending}>
        {family ? 'Lưu' : 'Thêm'}
      </Button>
    </form>
  );
}
