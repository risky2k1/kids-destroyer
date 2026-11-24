import 'server-only';
import { z } from 'zod';

import { createClient } from '@/core/supabase/server';
import { PLACE_SELECT, toPlace, type PlaceRow } from './lib/mapping';
import type { Place, Tag, TagKind } from './lib/types';

type Client = Awaited<ReturnType<typeof createClient>>;

async function fetchTags(sb: Client): Promise<Tag[]> {
  const { data, error } = await sb
    .from('plc_tags')
    .select('id, kind, name, emoji, sort')
    .order('kind')
    .order('sort')
    .order('name');
  if (error) throw new Error(error.message);
  return data.map((t) => ({ ...t, kind: t.kind as TagKind }));
}

const urlFor = (sb: Client) => (path: string) =>
  sb.storage.from('places').getPublicUrl(path).data.publicUrl;

export async function listTags(): Promise<Tag[]> {
  return fetchTags(await createClient());
}

/** Every place with its tags; readable by anyone (RLS). */
export async function loadPlaces(): Promise<{ places: Place[]; tags: Tag[] }> {
  const sb = await createClient();
  const [tags, { data, error }] = await Promise.all([
    fetchTags(sb),
    sb.from('plc_places').select(PLACE_SELECT).order('name'),
  ]);
  if (error) throw new Error(error.message);
  const tagsById = new Map(tags.map((t) => [t.id, t]));
  const places = (data as PlaceRow[]).map((row) => toPlace(row, tagsById, urlFor(sb)));
  return { places, tags };
}

export async function getPlace(id: string): Promise<{ place: Place | null; tags: Tag[] }> {
  const sb = await createClient();
  // A malformed id in the URL would make Postgres throw (22P02); treat it as "not found".
  if (!z.uuid().safeParse(id).success) return { place: null, tags: await fetchTags(sb) };
  const [tags, { data, error }] = await Promise.all([
    fetchTags(sb),
    sb.from('plc_places').select(PLACE_SELECT).eq('id', id).maybeSingle(),
  ]);
  if (error) throw new Error(error.message);
  const tagsById = new Map(tags.map((t) => [t.id, t]));
  return { place: data ? toPlace(data as PlaceRow, tagsById, urlFor(sb)) : null, tags };
}
