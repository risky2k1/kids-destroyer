'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { useActionToast } from '@/core/ui/useActionToast';
import { TAG_KIND_LABELS, type Tag, type TagKind } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/themes/neobrutal/ui/tooltip';
import { deleteTag, moveTag, saveTag } from '../actions';
import { IconPicker } from './IconPicker';
import { useRunAction } from './useRunAction';

function TagFields({ kind, tag }: { kind: TagKind; tag?: Tag }) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      {tag && <input type="hidden" name="id" value={tag.id} />}
      {kind === 'category' && (
        <IconPicker
          key={`${tag?.id ?? 'new'}-${tag?.icon ?? ''}-${tag?.emoji ?? ''}`}
          defaultIcon={tag?.icon ?? null}
          defaultEmoji={tag?.emoji ?? null}
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
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="neutral"
              aria-label="Lên"
              disabled={first || moving}
              onClick={() => run(() => moveTag(tag.id, 'up'))}
            />
          }
        >
          <ArrowUp />
        </TooltipTrigger>
        <TooltipContent>Lên</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="neutral"
              aria-label="Xuống"
              disabled={last || moving}
              onClick={() => run(() => moveTag(tag.id, 'down'))}
            />
          }
        >
          <ArrowDown />
        </TooltipTrigger>
        <TooltipContent>Xuống</TooltipContent>
      </Tooltip>
      <ConfirmDelete id={tag.id} label={tag.name} action={deleteTag} />
    </li>
  );
}

export function TagColumn({ kind, tags }: { kind: TagKind; tags: Tag[] }) {
  const [, formAction, adding] = useActionToast(saveTag, 'Đã thêm');
  return (
    <Card size="sm" className="bg-secondary-background">
      <CardHeader>
        <CardTitle>
          {TAG_KIND_LABELS[kind]} <span className="text-foreground/50">({tags.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tags.length === 0 && <p className="text-sm text-foreground/60">Chưa có mục nào.</p>}
        <TooltipProvider delay={200}>
          <ul className="flex flex-col gap-2">
            {tags.map((tag, i) => (
              <TagRow key={tag.id} tag={tag} first={i === 0} last={i === tags.length - 1} />
            ))}
          </ul>
        </TooltipProvider>
        <form
          action={formAction}
          className="flex items-center gap-1.5 border-t-2 border-border/20 pt-3"
        >
          <TagFields kind={kind} />
          <Button type="submit" size="sm" disabled={adding}>
            + Thêm
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
