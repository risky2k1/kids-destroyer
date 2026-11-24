import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { PLACES_PATHS, type Place, type Tag } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { PlacesTable } from './components/PlacesTable';

export function PlacesAdminView({ places, tags }: { places: Place[]; tags: Tag[] }) {
  return (
    <>
      <PageHeader
        icon={MapPin}
        title="Đi đâu"
        actions={
          <div className="flex gap-1.5">
            <Button
              render={<a href={PLACES_PATHS.public} target="_blank" rel="noopener" />}
              nativeButton={false}
              size="xs"
              variant="neutral"
            >
              Trang công khai ↗
            </Button>
            <Button
              render={<Link href={PLACES_PATHS.tags} />}
              nativeButton={false}
              size="xs"
              variant="neutral"
            >
              Quản lý tag
            </Button>
            <Button render={<Link href={PLACES_PATHS.new} />} nativeButton={false} size="xs">
              + Thêm quán
            </Button>
          </div>
        }
      />
      <div className="p-3">
        {places.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-base border-2 border-border bg-secondary-background p-6">
            <p>Chưa có quán nào.</p>
            <Button render={<Link href={PLACES_PATHS.new} />} nativeButton={false}>
              + Thêm quán
            </Button>
          </div>
        ) : (
          <PlacesTable places={places} tags={tags} />
        )}
      </div>
    </>
  );
}
