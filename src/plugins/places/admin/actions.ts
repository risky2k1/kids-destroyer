'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import type { ActionState } from '@/core/actions';
import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import {
  PLACES_PATHS,
  canAddPhoto,
  checkPhotoFile,
  dbErrorMessage,
  photoPath,
  placeFormValues,
  placeInput,
  tagInput,
  vietnamInputToIso,
  visitInput,
  type Tag,
  type TagKind,
} from '@/plugins/places/shared';

const PERMISSION = 'places.manage';
const BUCKET = 'places';
const uuid = z.uuid();

function refresh() {
  revalidatePath(PLACES_PATHS.admin, 'layout');
  revalidatePath(PLACES_PATHS.public);
}

const fail = (error: { code?: string } | null): ActionState => ({
  ok: false,
  error: dbErrorMessage(error),
});
const badId: ActionState = { ok: false, error: 'Không tìm thấy' };

export async function savePlace(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const parsed = placeInput.safeParse(placeFormValues(fd));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const input = parsed.data;
  const rawId = fd.get('id');
  const existingId = typeof rawId === 'string' && rawId !== '' ? rawId : null;
  if (existingId && !uuid.safeParse(existingId).success) return badId;

  const sb = await createClient();
  const baseRow = {
    name: input.name,
    status: input.status,
    price_level: input.priceLevel,
    dishes: input.dishes,
    note: input.note,
    maps_url: input.mapsUrl,
    open_hours: input.openHours,
  };

  let id: string;
  if (existingId) {
    // rating and visited_on are maintained by the plc_visits trigger when editing.
    const { error } = await sb
      .from('plc_places')
      .update({ ...baseRow, updated_at: new Date().toISOString() })
      .eq('id', existingId);
    if (error) return fail(error);
    id = existingId;
  } else {
    const { data, error } = await sb.from('plc_places').insert(baseRow).select('id').single();
    if (error) return fail(error);
    id = data.id;

    const hasFirstVisit =
      input.status === 'visited' &&
      (input.rating !== null || input.visitedOn !== null || input.visitNote !== null);
    if (hasFirstVisit) {
      const visitedAt =
        (input.visitedOn ? vietnamInputToIso(input.visitedOn) : null) ?? new Date().toISOString();
      const { error: visitError } = await sb.from('plc_visits').insert({
        place_id: id,
        visited_at: visitedAt,
        rating: input.rating,
        note: input.visitNote,
      });
      if (visitError) return fail(visitError);
    }
  }

  // shortcut: not atomic; fine for a single admin editing at a time.
  const tagIds = [...input.categoryIds, ...input.vibeIds, input.areaId].filter(
    (t): t is string => t !== null,
  );
  const { error: delError } = await sb.from('plc_place_tags').delete().eq('place_id', id);
  if (delError) return fail(delError);
  if (tagIds.length > 0) {
    const { error: linkError } = await sb
      .from('plc_place_tags')
      .insert([...new Set(tagIds)].map((tag_id) => ({ place_id: id, tag_id })));
    if (linkError) return fail(linkError);
  }

  refresh();
  if (!existingId) redirect(PLACES_PATHS.edit(id));
  return { ok: true };
}

export async function deletePlace(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const id = String(fd.get('id') ?? '');
  if (!uuid.safeParse(id).success) return badId;
  const sb = await createClient();
  const { data, error } = await sb.from('plc_places').select('photos').eq('id', id).single();
  if (error) return fail(error);
  if (data.photos.length > 0) {
    const { error: rmError } = await sb.storage.from(BUCKET).remove(data.photos);
    if (rmError) return { ok: false, error: 'Không xóa được ảnh, thử lại nhé' };
  }
  const { error: delError } = await sb.from('plc_places').delete().eq('id', id);
  if (delError) return fail(delError);
  refresh();
  redirect(PLACES_PATHS.admin);
}

export async function addVisit(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const parsed = visitInput.safeParse({
    placeId: fd.get('placeId'),
    visitedAt: fd.get('visitedAt'),
    rating: fd.get('rating'),
    note: fd.get('note'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { placeId, visitedAt, rating, note } = parsed.data;

  const sb = await createClient();
  const { error: statusError } = await sb
    .from('plc_places')
    .update({ status: 'visited', updated_at: new Date().toISOString() })
    .eq('id', placeId)
    .eq('status', 'wishlist');
  if (statusError) return fail(statusError);

  const { error } = await sb.from('plc_visits').insert({
    place_id: placeId,
    visited_at: visitedAt,
    rating,
    note,
  });
  if (error) return fail(error);
  refresh();
  return { ok: true };
}

export async function updateVisit(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const id = String(fd.get('id') ?? '');
  if (!uuid.safeParse(id).success) return badId;
  const parsed = visitInput.safeParse({
    placeId: fd.get('placeId'),
    visitedAt: fd.get('visitedAt'),
    rating: fd.get('rating'),
    note: fd.get('note'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { visitedAt, rating, note } = parsed.data;

  const sb = await createClient();
  const { error } = await sb
    .from('plc_visits')
    .update({ visited_at: visitedAt, rating, note })
    .eq('id', id);
  if (error) return fail(error);
  refresh();
  return { ok: true };
}

export async function deleteVisit(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const id = String(fd.get('id') ?? '');
  if (!uuid.safeParse(id).success) return badId;
  const sb = await createClient();
  const { error } = await sb.from('plc_visits').delete().eq('id', id);
  if (error) return fail(error);
  refresh();
  return { ok: true };
}

export async function addPhoto(
  placeId: string,
  _: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requirePermission(PERMISSION);
  if (!uuid.safeParse(placeId).success) return badId;
  const file = fd.get('photo');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Chọn một ảnh' };
  const fileError = checkPhotoFile(file);
  if (fileError) return { ok: false, error: fileError };

  const sb = await createClient();
  const { data, error } = await sb.from('plc_places').select('photos').eq('id', placeId).single();
  if (error) return fail(error);
  if (!canAddPhoto(data.photos.length)) return { ok: false, error: 'Tối đa 5 ảnh' };

  const path = photoPath(placeId, file.type);
  const { error: upError } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (upError) return { ok: false, error: 'Không tải được ảnh lên' };

  const { error: saveError } = await sb
    .from('plc_places')
    .update({ photos: [...data.photos, path], updated_at: new Date().toISOString() })
    .eq('id', placeId);
  if (saveError) {
    await sb.storage.from(BUCKET).remove([path]);
    return fail(saveError);
  }
  refresh();
  return { ok: true };
}

export async function removePhoto(placeId: string, path: string): Promise<ActionState> {
  await requirePermission(PERMISSION);
  if (!uuid.safeParse(placeId).success) return badId;
  const sb = await createClient();
  const { data, error } = await sb.from('plc_places').select('photos').eq('id', placeId).single();
  if (error) return fail(error);
  if (!data.photos.includes(path)) return badId;

  const { error: saveError } = await sb
    .from('plc_places')
    .update({
      photos: data.photos.filter((p) => p !== path),
      updated_at: new Date().toISOString(),
    })
    .eq('id', placeId);
  if (saveError) return fail(saveError);
  // shortcut: if the storage delete fails the file is orphaned, but the place no longer shows it.
  await sb.storage.from(BUCKET).remove([path]);
  refresh();
  return { ok: true };
}

export async function saveTag(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const parsed = tagInput.safeParse({
    kind: fd.get('kind'),
    name: fd.get('name'),
    emoji: fd.get('emoji') ?? '',
    icon: fd.get('icon') ?? '',
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { kind, name, emoji, icon } = parsed.data;
  const nextEmoji = icon ? null : emoji;
  const rawId = fd.get('id');
  const sb = await createClient();

  if (typeof rawId === 'string' && rawId !== '') {
    if (!uuid.safeParse(rawId).success) return badId;
    const { error } = await sb
      .from('plc_tags')
      .update({ name, emoji: nextEmoji, icon })
      .eq('id', rawId);
    if (error) return fail(error);
  } else {
    const { data: last } = await sb
      .from('plc_tags')
      .select('sort')
      .eq('kind', kind)
      .order('sort', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await sb
      .from('plc_tags')
      .insert({ kind, name, emoji: nextEmoji, icon, sort: (last?.sort ?? -1) + 1 });
    if (error) return fail(error);
  }
  refresh();
  return { ok: true };
}

export async function createTagInline(input: {
  kind: TagKind;
  name: string;
  icon?: string | null;
}): Promise<{ ok: true; tag: Tag } | { ok: false; error: string }> {
  await requirePermission(PERMISSION);
  const parsed = tagInput.safeParse({
    kind: input.kind,
    name: input.name,
    emoji: '',
    icon: input.icon ?? '',
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { kind, name, icon } = parsed.data;

  const sb = await createClient();
  const { data: last } = await sb
    .from('plc_tags')
    .select('sort')
    .eq('kind', kind)
    .order('sort', { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await sb
    .from('plc_tags')
    .insert({ kind, name, emoji: null, icon, sort: (last?.sort ?? -1) + 1 })
    .select('id, kind, name, emoji, icon, sort')
    .single();
  if (error) return { ok: false, error: dbErrorMessage(error) };
  refresh();
  return { ok: true, tag: { ...data, kind: data.kind as TagKind } };
}

export async function deleteTag(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission(PERMISSION);
  const id = String(fd.get('id') ?? '');
  if (!uuid.safeParse(id).success) return badId;
  const sb = await createClient();
  const { error } = await sb.from('plc_tags').delete().eq('id', id);
  if (error) return fail(error);
  refresh();
  return { ok: true };
}

export async function moveTag(id: string, dir: 'up' | 'down'): Promise<ActionState> {
  await requirePermission(PERMISSION);
  if (!uuid.safeParse(id).success) return badId;
  const sb = await createClient();
  const { data: tag, error } = await sb.from('plc_tags').select('kind').eq('id', id).single();
  if (error) return fail(error);
  const { data: siblings, error: listError } = await sb
    .from('plc_tags')
    .select('id')
    .eq('kind', tag.kind)
    .order('sort')
    .order('name');
  if (listError) return fail(listError);

  const order = siblings.map((s) => s.id);
  const i = order.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= order.length) return { ok: true };
  [order[i], order[j]] = [order[j], order[i]];

  // Renumber the whole kind so equal or gapped sort values (seed, older rows) can't block a move.
  const results = await Promise.all(
    order.map((tagId, sort) => sb.from('plc_tags').update({ sort }).eq('id', tagId)),
  );
  const firstError = results.find((r) => r.error)?.error ?? null;
  if (firstError) return fail(firstError);
  refresh();
  return { ok: true };
}
