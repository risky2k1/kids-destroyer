'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { exitKidMode } from '../kidActions';

export function ExitForm() {
  const [, formAction, pending] = useActionToast(exitKidMode);
  return (
    <form action={formAction} className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <Label htmlFor="parent-password">Mật khẩu của bố/mẹ</Label>
      <Input
        id="parent-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" disabled={pending}>
        Về khu phụ huynh
      </Button>
    </form>
  );
}
