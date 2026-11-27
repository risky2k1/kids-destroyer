import { Suspense } from 'react';
import { requireModule } from '@/core/modules/server';
import { PlacesPickerSkeleton } from '@/core/ui/PageSkeletons';
import { shareMeta } from '@/packages/seo';
import { PickerView } from '@/plugins/places/picker';

export const metadata = shareMeta({
  title: 'Đi đâu giờ?',
  description: 'Hết ý tưởng đi đâu thì bấm xáo nhé.',
  path: '/di-dau',
  index: false,
});

export default async function Page() {
  await requireModule('places');
  return (
    <Suspense fallback={<PlacesPickerSkeleton />}>
      <PickerView />
    </Suspense>
  );
}
