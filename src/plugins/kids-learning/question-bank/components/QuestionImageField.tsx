'use client';

import { useState } from 'react';
import { createClient } from '@/core/supabase/browser';
import { Button } from '@/themes/neobrutal/ui/button';
import { questionImageUrl } from '../lib/image';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX = 5 * 1024 * 1024;

function extFor(type: string) {
  if (type === 'image/jpeg') return 'jpg';
  return type.slice('image/'.length);
}

export function QuestionImageField({
  uid,
  imagePath,
  onChange,
}: {
  uid: string;
  imagePath: string | null;
  onChange?: (path: string) => void;
}) {
  const [path, setPath] = useState(imagePath ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const url = questionImageUrl(path || null);

  function update(next: string) {
    setPath(next);
    onChange?.(next);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setError('Chỉ nhận ảnh jpeg, png, webp hoặc gif');
      return;
    }
    if (file.size > MAX) {
      setError('Ảnh tối đa 5 MB');
      return;
    }
    const objectPath = `${uid}/${crypto.randomUUID()}.${extFor(file.type)}`;
    setBusy(true);
    const uploaded = await createClient()
      .storage.from('question-images')
      .upload(objectPath, file, { contentType: file.type });
    setBusy(false);
    if (uploaded.error) {
      setError('Không tải được ảnh');
      return;
    }
    setError('');
    update(objectPath);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="imagePath" value={path} />
      <input
        type="file"
        accept={TYPES.join(',')}
        aria-label="Ảnh câu hỏi"
        disabled={busy}
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {url ? (
        // Storage host is not configured for next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="max-h-60 object-contain" />
      ) : null}
      {path ? (
        <Button
          type="button"
          variant="neutral"
          size="sm"
          className="self-start"
          onClick={() => update('')}
        >
          Xóa ảnh
        </Button>
      ) : null}
      {busy ? <p className="text-sm">Đang tải…</p> : null}
      {error ? <p className="text-sm">{error}</p> : null}
    </div>
  );
}
