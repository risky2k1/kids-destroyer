'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { PHOTO_MAX_COUNT, canAddPhoto, type Place } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { addPhoto, removePhoto } from '../actions';
import { useRunAction } from './useRunAction';

export function PhotoManager({ place }: { place: Place }) {
  const [, formAction, uploading] = useActionToast(addPhoto.bind(null, place.id), 'Đã thêm ảnh');
  const [removing, run] = useRunAction();

  return (
    <section className="flex max-w-2xl flex-col gap-3">
      <Label>
        Ảnh ({place.photos.length}/{PHOTO_MAX_COUNT})
      </Label>
      {place.photos.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {place.photos.map((photo) => (
            <li key={photo.path} className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
              <img
                src={photo.url}
                alt=""
                className="size-24 rounded-base border-2 border-border object-cover"
              />
              <Button
                type="button"
                size="xs"
                variant="neutral"
                disabled={removing}
                onClick={() => run(() => removePhoto(place.id, photo.path), 'Đã xóa ảnh')}
              >
                Xóa
              </Button>
            </li>
          ))}
        </ul>
      )}
      {canAddPhoto(place.photos.length) && (
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <Input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            className="h-10 max-w-xs cursor-pointer"
          />
          <Button type="submit" size="sm" disabled={uploading}>
            {uploading ? 'Đang tải…' : 'Tải ảnh lên'}
          </Button>
          <p className="w-full text-xs text-foreground/60">JPG, PNG, WEBP · tối đa 2 MB mỗi ảnh</p>
        </form>
      )}
    </section>
  );
}
