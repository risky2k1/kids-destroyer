import { Tags } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { PLACES_PATHS, TAG_KINDS, type Tag } from '@/plugins/places/shared';
import { TagColumn } from './components/TagColumn';

export function TagsAdminView({ tags }: { tags: Tag[] }) {
  return (
    <>
      <PageHeader
        icon={Tags}
        title="Loại, vibe, khu vực"
        crumbs={[{ href: PLACES_PATHS.admin, label: 'Đi đâu' }]}
      />
      <div className="grid gap-4 p-3 lg:grid-cols-3">
        {TAG_KINDS.map((kind) => (
          <TagColumn key={kind} kind={kind} tags={tags.filter((t) => t.kind === kind)} />
        ))}
      </div>
    </>
  );
}
