import { z } from 'zod';
import { MediaAdminView } from '@/packages/media/server';
import type { MediaKind, MediaVisibility } from '@/packages/media';

const uuidSchema = z.uuid();

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawFolder = first(sp.folder);
  const folderId = uuidSchema.safeParse(rawFolder).success ? rawFolder : null;

  const rawVis = first(sp.visibility);
  const visibility: 'all' | MediaVisibility =
    rawVis === 'public' || rawVis === 'private' ? rawVis : 'all';

  const rawKind = first(sp.kind);
  const kind: 'all' | MediaKind = rawKind === 'image' || rawKind === 'document' ? rawKind : 'all';

  const search = first(sp.q);

  return <MediaAdminView folderId={folderId} visibility={visibility} kind={kind} search={search} />;
}
