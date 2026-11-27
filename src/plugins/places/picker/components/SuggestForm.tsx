'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { OpeningHoursInput, TagIcon, type Tag } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { suggestPlace } from '../actions';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function TagChips({ name, tags }: { name: string; tags: Tag[] }) {
  if (tags.length === 0) return <p className="text-sm text-foreground/60">Chưa có mục nào.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <label
          key={tag.id}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-base border-2 border-border bg-secondary-background px-3 text-sm has-checked:bg-main has-checked:text-main-foreground"
        >
          <input type="checkbox" name={name} value={tag.id} className="sr-only" />
          <TagIcon tag={tag} className="size-4" />
          {tag.name}
        </label>
      ))}
    </div>
  );
}

export function SuggestForm({ tags }: { tags: Tag[] }) {
  const [state, formAction, pending] = useActionToast(suggestPlace, 'Đã gửi đề xuất');
  const formRef = useRef<HTMLFormElement>(null);
  const [seen, setSeen] = useState(state);
  const [hoursKey, setHoursKey] = useState(0);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) setHoursKey((key) => key + 1);
  }
  const ofKind = (kind: Tag['kind']) => tags.filter((t) => t.kind === kind);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
  }, [state]);

  // Dispatch manually instead of <form action>: React resets an action form after every submit,
  // which would wipe the fields when the server only rejects one of them.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Tên quán" htmlFor="suggest-name">
        <Input id="suggest-name" name="name" maxLength={100} required />
      </Field>
      <Field label="Ghi chú" htmlFor="suggest-note">
        <Textarea id="suggest-note" name="note" maxLength={2000} rows={3} />
      </Field>
      <Field label="Loại quán">
        <TagChips name="categoryIds" tags={ofKind('category')} />
      </Field>
      <Field label="Vibe">
        <TagChips name="vibeIds" tags={ofKind('vibe')} />
      </Field>
      <Field label="Link Google Maps" htmlFor="suggest-maps">
        <Input
          id="suggest-maps"
          name="mapsUrl"
          type="url"
          inputMode="url"
          placeholder="https://maps.app.goo.gl/…"
        />
      </Field>
      <Field label="Giờ mở cửa">
        <OpeningHoursInput key={hoursKey} defaultValue={[]} />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm font-bold text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 w-full">
        {pending ? 'Đang gửi…' : 'Gửi đề xuất'}
      </Button>
    </form>
  );
}
