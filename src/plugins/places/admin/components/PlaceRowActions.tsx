'use client';

import Link from 'next/link';
import { PLACES_PATHS } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { markVisitedToday } from '../actions';
import { useRunAction } from './useRunAction';

export function PlaceRowActions({ id }: { id: string }) {
  const [pending, run] = useRunAction();
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        render={<Link href={PLACES_PATHS.edit(id)} />}
        nativeButton={false}
        size="xs"
        variant="neutral"
      >
        Sửa
      </Button>
      <Button
        type="button"
        size="xs"
        disabled={pending}
        onClick={() => run(() => markVisitedToday(id), 'Đã ghi nhận hôm nay')}
      >
        Vừa đi hôm nay
      </Button>
    </div>
  );
}
