import { TagsAdminView } from '@/plugins/places/admin';
import { listTags } from '@/plugins/places/shared/server';

export default async function Page() {
  return <TagsAdminView tags={await listTags()} />;
}
