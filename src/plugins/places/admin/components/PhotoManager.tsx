'use client';

import { useTransition, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useActionToast } from '@/core/ui/useActionToast';
import {
  PHOTO_MAX_COUNT,
  canAddPhoto,
  checkPhotoFile,
  photoFileName,
  type Place,
} from '@/plugins/places/shared';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/themes/neobrutal/ui/attachment';
import { toast } from '@/themes/neobrutal/ui/toast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { addPhoto, removePhoto } from '../actions';
import { shrinkPhoto } from './shrinkPhoto';
import { useRunAction } from './useRunAction';

export function PhotoManager({ place }: { place: Place }) {
  const [, formAction, uploading] = useActionToast(addPhoto.bind(null, place.id), 'Đã thêm ảnh');
  const [removing, run] = useRunAction();
  const [preparing, startPreparing] = useTransition();
  const busy = uploading || preparing;

  // Shrink and check in the browser: a raw phone photo (3–6 MB) would hit the server action body
  // limit and crash the page before the server could answer with a friendly error.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = new FormData(form).get('photo');
    if (!(raw instanceof File) || raw.size === 0) return;
    startPreparing(async () => {
      const file = await shrinkPhoto(raw);
      const error = checkPhotoFile(file);
      if (error) {
        toast.add({ title: error, type: 'error' });
        return;
      }
      const fd = new FormData();
      fd.set('photo', file);
      // Context is lost after an await, so dispatch inside a fresh transition.
      startPreparing(() => formAction(fd));
      form.reset();
    });
  }

  return (
    <section className="flex max-w-2xl flex-col gap-3">
      <Label>
        Ảnh ({place.photos.length}/{PHOTO_MAX_COUNT})
      </Label>
      {place.photos.length > 0 && (
        <AttachmentGroup layout="grid">
          {place.photos.map((photo, index) => (
            <Attachment key={photo.path} variant="card">
              <AttachmentMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
                <img src={photo.url} alt="" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{photoFileName(photo.path)}</AttachmentTitle>
                <AttachmentDescription>Ảnh #{index + 1}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions className="justify-end">
                <AttachmentAction
                  size="xs"
                  disabled={removing}
                  onClick={() => run(() => removePhoto(place.id, photo.path), 'Đã xóa ảnh')}
                >
                  <Trash2 />
                  Xóa
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
      )}
      {canAddPhoto(place.photos.length) && (
        <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
          <Input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            className="h-10 max-w-xs cursor-pointer"
          />
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Đang tải…' : 'Tải ảnh lên'}
          </Button>
          <p className="w-full text-xs text-foreground/60">
            JPG, PNG, WEBP · ảnh lớn sẽ được thu nhỏ tự động
          </p>
        </form>
      )}
    </section>
  );
}
