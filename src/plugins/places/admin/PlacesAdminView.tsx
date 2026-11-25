import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { PLACES_PATHS, nowMinutesInVietnam, type Place, type Tag } from '@/plugins/places/shared';
import { buttonVariants } from '@/themes/neobrutal/ui/button';
import { PlacesTable } from './components/PlacesTable';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export function PlacesAdminView({ places, tags }: { places: Place[]; tags: Tag[] }) {
  const initialNowMinute = nowMinutesInVietnam();
  return (
    <>
      <PageHeader
        icon={MapPin}
        title="Đi đâu"
        actions={
          <div className="flex gap-1.5">
            <a
              href={PLACES_PATHS.public}
              target="_blank"
              rel="noopener"
              className={buttonVariants({
                size: 'sm',
                variant: 'neutral',
                className: `h-7 border-2 ${hardShadow}`,
              })}
            >
              Trang công khai ↗
            </a>
            <Link
              href={PLACES_PATHS.tags}
              className={buttonVariants({
                size: 'sm',
                variant: 'neutral',
                className: `h-7 border-2 ${hardShadow}`,
              })}
            >
              Quản lý tag
            </Link>
            <Link
              href={PLACES_PATHS.new}
              className={buttonVariants({ size: 'sm', className: `h-7 border-2 ${hardShadow}` })}
            >
              + Thêm quán
            </Link>
          </div>
        }
      />
      <PlacesTable places={places} tags={tags} initialNowMinute={initialNowMinute} />
    </>
  );
}
