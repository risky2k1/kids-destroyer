'use client';

import type { ActionState } from '@/core/actions';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';

type Item = { id: string; name: string; sort: number };
type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

function Row({ item, save, remove }: { item?: Item; save: Action; remove: Action }) {
  const [, formAction, pending] = useActionToast(save, item ? 'Đã lưu' : 'Đã thêm');
  return (
    <div className="flex items-center gap-2">
      <form
        action={formAction}
        className="flex min-w-0 flex-1 items-center gap-2"
        key={item?.id ?? 'new'}
      >
        {item && <input type="hidden" name="id" value={item.id} />}
        <Input
          name="name"
          defaultValue={item?.name}
          placeholder={item ? undefined : 'Tên mới'}
          aria-label="Tên"
          className="min-w-0 flex-1"
          required
        />
        <Input
          name="sort"
          type="number"
          min={0}
          defaultValue={item?.sort ?? 0}
          aria-label="Thứ tự"
          className="w-16 shrink-0"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {item ? 'Lưu' : 'Thêm'}
        </Button>
      </form>
      {item && <ConfirmDelete id={item.id} label={item.name} action={remove} />}
    </div>
  );
}

export function NamedList(props: { title: string; items: Item[]; save: Action; remove: Action }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {props.items.map((item) => (
          <Row key={item.id} item={item} save={props.save} remove={props.remove} />
        ))}
        <Row save={props.save} remove={props.remove} />
      </CardContent>
    </Card>
  );
}
