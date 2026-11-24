import { PlacesAdminView } from '@/plugins/places/admin';
import { loadPlaces } from '@/plugins/places/shared/server';

export default async function Page() {
  const { places, tags } = await loadPlaces();
  return <PlacesAdminView places={places} tags={tags} />;
}
