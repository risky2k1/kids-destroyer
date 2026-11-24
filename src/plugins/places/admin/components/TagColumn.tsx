'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { useActionToast } from '@/core/ui/useActionToast';
import { TAG_KIND_LABELS, type Tag, type TagKind } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { deleteTag, moveTag, saveTag } from '../actions';
import { useRunAction } from './useRunAction';

function TagFields({ kind, tag }: { kind: TagKind; tag?: Tag }) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      {tag && <input type="hidden" name="id" value={tag.id} />}
      {kind === 'category' && (
        <Input
          name="emoji"
          defaultValue={tag?.emoji ?? ''}
          maxLength={8}
          aria-label="Emoji"
          placeholder="🍲"
          className="h-9 w-14 text-center"
        />
      )}
      <Input
        name="name"
        defaultValue={tag?.name ?? ''}
        maxLength={40}
        required
        aria-label="Tên"
        placeholder={tag ? undefined : 'Thêm mới…'}
        className="h-9 min-w-0 flex-1"
      />
    </>
  );
}

function TagRow({ tag, first, last }: { tag: Tag; first: boolean; last: boolean }) {
  const [, formAction, saving] = useActionToast(saveTag, 'Đã lưu');
  const [moving, run] = useRunAction();
  return (
    <li className="group/row flex items-center gap-1.5">
      <form action={formAction} className="flex min-w-0 flex-1 items-center gap-1.5">
        <TagFields kind={tag.kind} tag={tag} />
        <Button type="submit" size="sm" variant="neutral" disabled={saving}>
          Lưu
        </Button>
      </form>
      <Button
        type="button"
        size="icon-sm"
        variant="neutral"
        aria-label="Lên"
        disabled={first || moving}
        onClick={() => run(() => moveTag(tag.id, 'up'))}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="neutral"
        aria-label="Xuống"
        disabled={last || moving}
        onClick={() => run(() => moveTag(tag.id, 'down'))}
      >
        <ArrowDown />
      </Button>
      <ConfirmDelete id={tag.id} label={tag.name} action={deleteTag} />
    </li>
  );
}

export function TagColumn({ kind, tags }: { kind: TagKind; tags: Tag[] }) {
  const [, formAction, adding] = useActionToast(saveTag, 'Đã thêm');
  return (
    <section className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
      <h2 className="font-heading">
        {TAG_KIND_LABELS[kind]} <span className="text-foreground/50">({tags.length})</span>
      </h2>
      {tags.length === 0 && <p className="text-sm text-foreground/60">Chưa có mục nào.</p>}
      <ul className="flex flex-col gap-2">
        {tags.map((tag, i) => (
          <TagRow key={tag.id} tag={tag} first={i === 0} last={i === tags.length - 1} />
        ))}
      </ul>
      <form
        action={formAction}
        className="flex items-center gap-1.5 border-t-2 border-border/20 pt-3"
      >
        <TagFields kind={kind} />
        <Button type="submit" size="sm" disabled={adding}>
          + Thêm
        </Button>
      </form>
    </section>
  );
}
