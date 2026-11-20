'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { renameRole } from '../actions';

export function RoleRenameForm({ role }: { role: { id: string; name: string } }) {
  const [, formAction, pending] = useActionToast(renameRole, 'Đã đổi tên vai trò');

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="id" value={role.id} />
      <Input
        name="name"
        defaultValue={role.name}
        placeholder="Tên vai trò"
        aria-label="Tên vai trò"
        maxLength={50}
        required
        className="h-8 min-w-0 flex-1"
      />
      <Button type="submit" size="sm" disabled={pending}>
        Lưu
      </Button>
    </form>
  );
}
