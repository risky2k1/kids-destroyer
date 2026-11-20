'use client';

import { useEffect, useRef, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/themes/neobrutal/ui/dialog';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { resetPassword } from '../actions';

function ResetPasswordForm({ userId, onDone }: { userId: string; onDone?: () => void }) {
  const [state, formAction, pending] = useActionToast(resetPassword, 'Đã đặt lại mật khẩu');
  const seen = useRef(state);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`reset-pwd-${userId}`}>Mật khẩu mới</Label>
        <Input
          id={`reset-pwd-${userId}`}
          name="password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          minLength={8}
          maxLength={72}
          required
          className="h-9"
        />
      </div>
      <DialogFooter className="gap-2">
        <DialogClose render={<Button type="button" variant="neutral" />}>Thôi</DialogClose>
        <Button type="submit" disabled={pending}>
          Lưu
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ResetPasswordDialog({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            title="Đặt lại mật khẩu"
            aria-label={`Đặt lại mật khẩu cho ${displayName}`}
            className="inline-flex size-7 items-center justify-center rounded-base text-foreground/50 hover:bg-foreground/5 hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
          />
        }
      >
        <KeyRound className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <ResetPasswordForm userId={userId} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
