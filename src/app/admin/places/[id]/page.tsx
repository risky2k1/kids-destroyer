import { notFound } from 'next/navigation';
import { PlaceEditView } from '@/plugins/places/admin';
import { getPlace } from '@/plugins/places/shared/server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { place, tags } = await getPlace(id);
  if (!place) notFound();
  return <PlaceEditView place={place} tags={tags} />;
}
