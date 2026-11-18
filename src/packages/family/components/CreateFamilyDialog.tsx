'use client';

import { useState, type ReactElement } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/themes/neobrutal/ui/dialog';
import { FamilyNameForm } from './FamilyNameForm';

export function CreateFamilyDialog({ children }: { children: ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogTitle>Gia đình mới</DialogTitle>
        <FamilyNameForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
