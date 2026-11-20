'use client';

import { useEffect, useRef } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { createAccount } from '../actions';
import type { RoleSummary } from '../queries';

export function AccountCreateForm({
  roles,
  onDone,
}: {
  roles: RoleSummary[];
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionToast(createAccount, 'Đã tạo tài khoản');
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) onDone?.();
  }, [state, onDone]);

  const assignableRoles = roles.filter((r) => r.id !== 'parent');

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-account-email">Email</Label>
        <Input
          id="create-account-email"
          name="email"
          type="email"
          placeholder="vd: giaovien@example.com"
          aria-label="Email"
          required
          className="h-9"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-account-display-name">Tên hiển thị</Label>
        <Input
          id="create-account-display-name"
          name="displayName"
          placeholder="vd: Cô Mai"
          aria-label="Tên hiển thị"
          maxLength={50}
          required
          className="h-9"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-account-password">Mật khẩu</Label>
        <Input
          id="create-account-password"
          name="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          aria-label="Mật khẩu"
          minLength={8}
          maxLength={72}
          required
          className="h-9"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-account-role">Vai trò</Label>
        <NativeSelect
          id="create-account-role"
          name="roleId"
          aria-label="Vai trò"
          required
          defaultValue=""
          className="h-9"
        >
          <option value="" disabled>
            -- Chọn vai trò --
          </option>
          {assignableRoles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          Tạo
        </Button>
      </div>
    </form>
  );
}
