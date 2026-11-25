'use client';

import { useState, useTransition } from 'react';
import { Hash, Type } from 'lucide-react';
import { initialActionState, type ActionState } from '@/core/actions';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { RecordTable } from '@/core/ui/RecordTable';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { toast } from '@/themes/neobrutal/ui/toast';
import { changedRows, type Draft } from '../lib/drafts';

type Item = { id: string; name: string; sort: number };
type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;
type Section = 'subjects' | 'grades';

const fieldClass =
  'h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 focus-visible:ring-offset-0';
const smallButton = 'h-7 border';

function AddRow({ section, save }: { section: Section; save: Action }) {
  const [, formAction, pending] = useActionToast(save, 'Đã thêm');
  return (
    <form action={formAction} className="flex items-center gap-2">
      <Input
        id={`new-${section}`}
        name="name"
        placeholder="Tên mới"
        aria-label="Tên"
        className={`${fieldClass} w-48`}
        required
      />
      <Input
        name="sort"
        type="number"
        min={0}
        defaultValue={0}
        aria-label="Thứ tự"
        className={`${fieldClass} w-16`}
      />
      <Button type="submit" variant="noShadow" size="xs" className={smallButton} disabled={pending}>
        Thêm
      </Button>
    </form>
  );
}

/** Edit cells freely; one "Lưu thay đổi" saves every changed row (same per-row action as before). */
export function NamedList(props: {
  section: Section;
  title: string;
  items: Item[];
  save: Action;
  remove: Action;
}) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, startSaving] = useTransition();
  const changed = changedRows(props.items, drafts);

  function edit(item: Item, patch: Partial<Draft>) {
    setDrafts((d) => ({
      ...d,
      [item.id]: { ...(d[item.id] ?? { name: item.name, sort: String(item.sort) }), ...patch },
    }));
  }

  function saveAll() {
    if (changed.length === 0 || saving) return;
    startSaving(async () => {
      const failed: string[] = [];
      for (const row of changed) {
        const fd = new FormData();
        fd.set('id', row.id);
        fd.set('name', row.name);
        fd.set('sort', row.sort);
        const res = await props.save(initialActionState, fd);
        if (res.error) failed.push(res.error);
        else
          setDrafts((d) => {
            const next = { ...d };
            delete next[row.id];
            return next;
          });
      }
      if (failed.length) toast.add({ title: failed[0], type: 'error' });
      else toast.add({ title: `Đã lưu ${changed.length} dòng`, type: 'success' });
    });
  }

  const value = (item: Item) => drafts[item.id] ?? { name: item.name, sort: String(item.sort) };
  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveAll();
  };

  return (
    <RecordTable
      view={{
        label: props.title.toLowerCase(),
        actions: changed.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Button
              type="button"
              variant="neutral"
              size="xs"
              className={`${smallButton} shadow-none hover:translate-x-0 hover:translate-y-0`}
              onClick={() => setDrafts({})}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              variant="noShadow"
              size="xs"
              className={smallButton}
              onClick={saveAll}
              disabled={saving}
            >
              Lưu thay đổi ({changed.length})
            </Button>
          </span>
        ),
      }}
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: Type,
          sortValue: (item) => item.name,
          filterValue: (item) => item.name,
          render: (item) => (
            <Input
              value={value(item).name}
              onChange={(e) => edit(item, { name: e.target.value })}
              onKeyDown={onEnter}
              aria-label="Tên"
              className={fieldClass}
            />
          ),
        },
        {
          key: 'sort',
          label: 'Thứ tự',
          icon: Hash,
          className: 'w-24',
          sortValue: (item) => item.sort,
          render: (item) => (
            <Input
              type="number"
              min={0}
              value={value(item).sort}
              onChange={(e) => edit(item, { sort: e.target.value })}
              onKeyDown={onEnter}
              aria-label="Thứ tự"
              className={`${fieldClass} w-16`}
            />
          ),
        },
        {
          key: 'actions',
          label: '',
          icon: Hash,
          className: 'w-px',
          render: (item) => <ConfirmDelete id={item.id} label={item.name} action={props.remove} />,
        },
      ]}
      rows={props.items}
      getId={(item) => item.id}
      addRow={<AddRow section={props.section} save={props.save} />}
    />
  );
}
