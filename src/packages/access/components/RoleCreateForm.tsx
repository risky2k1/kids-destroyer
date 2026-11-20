'use client';

import { useEffect, useRef } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { createRole } from '../actions';

export function RoleCreateForm({ onDone }: { onDone?: () => void }) {
  const [state, formAction, pending] = useActionToast(createRole, 'Đã tạo vai trò');
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-role-id">Mã vai trò</Label>
        <Input
          id="create-role-id"
          name="id"
          placeholder="vd: teacher_assistant"
          aria-label="Mã vai trò"
          pattern="^[a-z][a-z0-9_]{1,30}$"
          title="Mã gồm chữ thường, số, gạch dưới; 2-31 ký tự, bắt đầu bằng chữ"
          required
          className="h-9 font-mono text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-role-name">Tên vai trò</Label>
        <Input
          id="create-role-name"
          name="name"
          placeholder="vd: Trợ giảng"
          aria-label="Tên vai trò"
          maxLength={50}
          required
          className="h-9"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          Tạo
        </Button>
      </div>
    </form>
  );
}
