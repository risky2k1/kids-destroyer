import { MapPin } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { PageHeader } from '@/core/ui/PageHeader';
import {
  PLACES_PATHS,
  toVietnamDatetimeLocal,
  type Place,
  type Tag,
} from '@/plugins/places/shared';
import { deletePlace } from './actions';
import { PhotoManager } from './components/PhotoManager';
import { PlaceForm } from './components/PlaceForm';
import { VisitManager } from './components/VisitManager';

export function PlaceEditView({ place, tags }: { place: Place | null; tags: Tag[] }) {
  const defaultVisitedAt = toVietnamDatetimeLocal();
  return (
    <>
      <PageHeader
        icon={MapPin}
        title={place ? place.name : 'Thêm quán'}
        crumbs={[{ href: PLACES_PATHS.admin, label: 'Đi đâu' }]}
        actions={
          // ConfirmDelete's trigger hides at md+ until a table row is hovered; keep it visible here.
          place && (
            <div className="[&_button]:opacity-100">
              <ConfirmDelete id={place.id} label={place.name} action={deletePlace} />
            </div>
          )
        }
      />
      <div className="flex flex-col gap-8 p-3">
        <PlaceForm
          key={place?.id ?? 'new'}
          place={place}
          tags={tags}
          defaultVisitedAt={defaultVisitedAt}
        />
        {place ? (
          <>
            <VisitManager place={place} defaultVisitedAt={defaultVisitedAt} />
            <PhotoManager place={place} />
          </>
        ) : (
          <p className="text-sm text-foreground/60">
            Lưu quán xong thì thêm được ảnh và lịch sử lần đi.
          </p>
        )}
      </div>
    </>
  );
}
