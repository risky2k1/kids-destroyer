'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { createParent } from '../actions';

export function ParentForm({ familyId }: { familyId: string }) {
  const [, formAction, pending] = useActionToast(createParent, 'Đã tạo tài khoản');
  return (
    <form action={formAction} className="border-border flex flex-col gap-3 border-t-2 pt-3">
      <input type="hidden" name="familyId" value={familyId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor="parent-name">Tên hiển thị</Label>
        <Input id="parent-name" name="displayName" required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="parent-email">Email</Label>
        <Input id="parent-email" name="email" type="email" autoComplete="off" required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="parent-password">Mật khẩu (tối thiểu 8 ký tự)</Label>
        <Input
          id="parent-password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        Tạo tài khoản phụ huynh
      </Button>
    </form>
  );
}
