import { Suspense } from 'react';
import { TableSkeleton } from '@/core/ui/PageSkeletons';
import { PlacesAdminView } from '@/plugins/places/admin';
import { loadPlaces } from '@/plugins/places/shared/server';

async function PlacesContent() {
  const { places, tags } = await loadPlaces();
  return <PlacesAdminView places={places} tags={tags} />;
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton columns={7} rows={6} />}>
      <PlacesContent />
    </Suspense>
  );
}
