import { Suspense } from 'react';
import { CardGridSkeleton } from '@/core/ui/PageSkeletons';
import { TagsAdminView } from '@/plugins/places/admin';
import { listTags } from '@/plugins/places/shared/server';

async function TagsContent() {
  return <TagsAdminView tags={await listTags()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<CardGridSkeleton count={3} cols={3} />}>
      <TagsContent />
    </Suspense>
  );
}
