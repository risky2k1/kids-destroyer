import { PlaceEditView } from '@/plugins/places/admin';
import { listTags } from '@/plugins/places/shared/server';

export default async function Page() {
  return <PlaceEditView place={null} tags={await listTags()} />;
}
