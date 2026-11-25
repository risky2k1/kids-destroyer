'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { TAG_KIND_LABELS, type Tag, type TagKind } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { toast } from '@/themes/neobrutal/ui/toast';
import { createTagInline } from '../actions';
import { IconPicker } from './IconPicker';

type Props = {
  kind: TagKind;
  onCreated: (tag: Tag) => void;
};

/** Inline tag creator inside PlaceForm (uses a div + button, never a nested <form>). */
export function InlineTagCreator({ kind, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createTagInline({ kind, name, icon });
      if (!res.ok) {
        toast.add({ title: res.error, type: 'error' });
        return;
      }
      toast.add({ title: `Đã thêm ${TAG_KIND_LABELS[kind].toLowerCase()}`, type: 'success' });
      onCreated(res.tag);
      setName('');
      setIcon(null);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="neutral"
        onClick={() => setOpen(true)}
        className="h-9 gap-1 px-2.5 text-xs"
      >
        <Plus className="size-3.5" /> Thêm {TAG_KIND_LABELS[kind].toLowerCase()}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-base border-2 border-border bg-secondary-background p-2">
      {kind === 'category' && <IconPicker value={icon} onChange={setIcon} />}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={`Tên ${TAG_KIND_LABELS[kind].toLowerCase()} mới…`}
        maxLength={40}
        className="h-9 min-w-36 flex-1"
      />
      <Button type="button" size="sm" disabled={pending || !name.trim()} onClick={submit}>
        {pending ? 'Đang thêm…' : 'Thêm'}
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="neutral"
        aria-label="Hủy"
        onClick={() => setOpen(false)}
      >
        <X />
      </Button>
    </div>
  );
}
