import { MapPin } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { PageHeader } from '@/core/ui/PageHeader';
import { PLACES_PATHS, type Place, type Tag } from '@/plugins/places/shared';
import { deletePlace } from './actions';
import { PhotoManager } from './components/PhotoManager';
import { PlaceForm } from './components/PlaceForm';

export function PlaceEditView({ place, tags }: { place: Place | null; tags: Tag[] }) {
  return (
    <>
      <PageHeader
        icon={MapPin}
        title={place ? place.name : 'Thêm quán'}
        crumbs={[{ href: PLACES_PATHS.admin, label: 'Đi đâu' }]}
        actions={place && <ConfirmDelete id={place.id} label={place.name} action={deletePlace} />}
      />
      <div className="flex flex-col gap-8 p-3">
        <PlaceForm key={place?.id ?? 'new'} place={place} tags={tags} />
        {place ? (
          <PhotoManager place={place} />
        ) : (
          <p className="text-sm text-foreground/60">Lưu quán xong thì thêm được ảnh.</p>
        )}
      </div>
    </>
  );
}
