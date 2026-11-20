'use client';

import { useState, type ReactElement } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/themes/neobrutal/ui/dialog';
import type { RoleSummary } from '../queries';
import { AccountCreateForm } from './AccountCreateForm';

export function CreateAccountDialog({
  roles,
  children,
}: {
  roles: RoleSummary[];
  children: ReactElement;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogTitle>Tài khoản mới</DialogTitle>
        <AccountCreateForm roles={roles} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
