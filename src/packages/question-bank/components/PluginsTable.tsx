'use client';

import { useState } from 'react';
import { Hash, Puzzle, Text, ToggleLeft } from 'lucide-react';
import type { ActionState } from '@/core/actions';
import { RecordTable } from '@/core/ui/RecordTable';
import { useActionToast } from '@/core/ui/useActionToast';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import { setPluginEnabled } from '../actions';

type Row = { id: string; name: string; description: string; count: number; enabled: boolean };

function EnabledToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [synced, setSynced] = useState(enabled);
  const [state, formAction, pending] = useActionToast(setPluginEnabled, 'Đã lưu');
  const [seen, setSeen] = useState<ActionState>(state);
  if (enabled !== synced) {
    setSynced(enabled);
    setOn(enabled);
  }
  if (state !== seen) {
    setSeen(state);
    if (state.error) setOn(enabled);
  }

  return (
    <Checkbox
      checked={on}
      disabled={pending}
      aria-label={on ? 'Đang bật' : 'Đang tắt'}
      onCheckedChange={(checked) => {
        setOn(checked);
        const fd = new FormData();
        fd.set('id', id);
        fd.set('enabled', String(checked));
        formAction(fd);
      }}
    />
  );
}

export function PluginsTable({ rows }: { rows: Row[] }) {
  return (
    <RecordTable
      columns={[
        {
          key: 'name',
          label: 'Dạng',
          icon: Puzzle,
          render: (row) => <span className="font-heading">{row.name}</span>,
        },
        { key: 'description', label: 'Mô tả', icon: Text, render: (row) => row.description },
        { key: 'count', label: 'Số câu', icon: Hash, render: (row) => row.count },
        {
          key: 'enabled',
          label: 'Bật',
          icon: ToggleLeft,
          render: (row) => <EnabledToggle id={row.id} enabled={row.enabled} />,
        },
      ]}
      rows={rows}
      getId={(row) => row.id}
      addRow={<span />}
    />
  );
}
