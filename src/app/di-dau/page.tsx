import { Suspense } from 'react';
import type { Metadata } from 'next';
import { requireModule } from '@/core/modules/server';
import { PlacesPickerSkeleton } from '@/core/ui/PageSkeletons';
import { PickerView } from '@/plugins/places/picker';

const title = 'Đi đâu giờ? 🎲';
const description = 'Hết ý tưởng đi đâu thì bấm xáo nhé.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description },
};

export default async function Page() {
  await requireModule('places');
  return (
    <Suspense fallback={<PlacesPickerSkeleton />}>
      <PickerView />
    </Suspense>
  );
}
