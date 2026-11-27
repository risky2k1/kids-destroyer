'use server';

import { revalidatePath } from 'next/cache';

import type { ActionState } from '@/core/actions';
import { createClient } from '@/core/supabase/server';
import {
  PLACES_PATHS,
  dbErrorMessage,
  suggestionFormValues,
  suggestionInput,
} from '@/plugins/places/shared';

const WRONG_TAG: ActionState = { ok: false, error: 'Chỉ chọn loại quán hoặc vibe có sẵn' };

function refresh() {
  revalidatePath(PLACES_PATHS.admin, 'layout');
  revalidatePath(PLACES_PATHS.public);
}

export async function suggestPlace(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = suggestionInput.safeParse(suggestionFormValues(fd));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const input = parsed.data;
  const tagIds = [...new Set([...input.categoryIds, ...input.vibeIds])];

  const sb = await createClient();
  if (tagIds.length > 0) {
    const { data, error } = await sb.from('plc_tags').select('id, kind').in('id', tagIds);
    if (error) return { ok: false, error: dbErrorMessage(error) };
    const allowed = new Set(
      (data ?? []).filter((t) => t.kind === 'category' || t.kind === 'vibe').map((t) => t.id),
    );
    if (tagIds.some((id) => !allowed.has(id))) return WRONG_TAG;
  }

  const id = crypto.randomUUID();
  const { error } = await sb.from('plc_places').insert({
    id,
    name: input.name,
    note: input.note,
    maps_url: input.mapsUrl,
    open_hours: input.openHours,
    status: 'wishlist',
    origin: 'community',
    review_status: 'pending',
  });
  if (error) return { ok: false, error: dbErrorMessage(error) };

  if (tagIds.length > 0) {
    const { error: linkError } = await sb
      .from('plc_place_tags')
      .insert(tagIds.map((tag_id) => ({ place_id: id, tag_id })));
    if (linkError) return { ok: false, error: dbErrorMessage(linkError) };
  }

  refresh();
  return { ok: true };
}
