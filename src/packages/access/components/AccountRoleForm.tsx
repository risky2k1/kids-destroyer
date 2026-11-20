'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { setAccountRole } from '../actions';
import type { RoleSummary } from '../queries';

export function AccountRoleForm({
  userId,
  currentRoleId,
  roles,
}: {
  userId: string;
  currentRoleId: string;
  roles: RoleSummary[];
}) {
  const [, formAction, pending] = useActionToast(setAccountRole, 'Đã đổi vai trò');

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <NativeSelect
        name="roleId"
        defaultValue={currentRoleId}
        className="h-7 w-auto border px-2 py-0 text-[13px] shadow-none"
        aria-label="Vai trò"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </NativeSelect>
      <Button type="submit" size="xs" variant="noShadow" className="h-7 border" disabled={pending}>
        Lưu
      </Button>
    </form>
  );
}
