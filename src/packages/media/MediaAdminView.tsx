import { FolderOpen } from 'lucide-react';
import { can } from '@/core/acl/access';
import { requireAnyPermission } from '@/core/auth/session';
import { PageHeader } from '@/core/ui/PageHeader';
import { MediaBrowser } from './components/MediaBrowser';
import type { MediaKind, MediaVisibility } from './lib/types';
import { listMediaFiles, listMediaFolders } from './queries';

export async function MediaAdminView({
  folderId,
  visibility,
  kind,
  search,
}: {
  folderId: string | null;
  visibility: 'all' | MediaVisibility;
  kind: 'all' | MediaKind;
  search: string;
}) {
  const user = await requireAnyPermission(['media.view', 'media.manage']);
  const canManage = can(user, 'media.manage');

  const [folders, files] = await Promise.all([
    listMediaFolders(),
    listMediaFiles({
      folderId: search.trim() ? undefined : folderId,
      visibility: visibility === 'all' ? undefined : visibility,
      kind: kind === 'all' ? undefined : kind,
      search: search.trim() || undefined,
      limit: 120,
    }),
  ]);

  return (
    <>
      <PageHeader icon={FolderOpen} title="Thư viện tệp" />
      <MediaBrowser
        folders={folders}
        files={files}
        currentFolderId={folderId}
        visibilityFilter={visibility}
        kindFilter={kind}
        searchQuery={search}
        canManage={canManage}
      />
    </>
  );
}
