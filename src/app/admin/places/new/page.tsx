import { Suspense } from 'react';
import { FormSkeleton } from '@/core/ui/PageSkeletons';
import { PlaceEditView } from '@/plugins/places/admin';
import { listTags } from '@/plugins/places/shared/server';

async function NewPlaceContent() {
  return <PlaceEditView place={null} tags={await listTags()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton fields={7} />}>
      <NewPlaceContent />
    </Suspense>
  );
}
