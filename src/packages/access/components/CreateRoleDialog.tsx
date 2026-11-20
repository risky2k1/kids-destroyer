'use client';

import { useState, type ReactElement } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/themes/neobrutal/ui/dialog';
import { RoleCreateForm } from './RoleCreateForm';

export function CreateRoleDialog({ children }: { children: ReactElement }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogTitle>Vai trò mới</DialogTitle>
        <RoleCreateForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
