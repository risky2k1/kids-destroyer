'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { NUMBER_FIELDS, TEXT_FIELDS } from './lib/fields';
import { QUALITIES } from './lib/options';
import { shiftCalendarDay } from './lib/serverDay';
import { blankDoc, characterDocSchema, starterDoc, type CharacterDoc } from './lib/doc';
import catalogData from './lib/catalog.json';

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function refresh(id?: string) {
  if (id) revalidatePath(`/admin/sxs/c/${id}`, 'layout');
  revalidatePath('/admin/sxs');
}

async function mutateDoc(
  id: string,
  fn: (doc: CharacterDoc) => CharacterDoc | void,
): Promise<CharacterDoc> {
  await requirePermission('sxs.use');
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from('sxs_characters')
    .select('data')
    .eq('id', id)
    .single();
  fail(error);
  if (!row) throw new Error('Character not found');

  const doc = characterDocSchema.parse(row.data);
  const result = fn(doc);
  const next = result ?? doc;
  const validated = characterDocSchema.parse(next);

  const { error: updateError } = await supabase
    .from('sxs_characters')
    .update({
      data: validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  fail(updateError);

  return validated;
}

const text = z.string().max(500);
const patchSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    combatPower: text.optional(),
    currentClass: text.optional(),
    rankTier: text.optional(),
    currentMap: text.optional(),
    mirageTower: text.optional(),
    dailyDungeonStatus: text.optional(),
    spendingTier: text.optional(),
    gold: text.optional(),
    morningStar: z.union([text, z.number().transform((v) => String(v))]).optional(),
    coloredDiamond: text.optional(),
    stamina: text.optional(),
    battleEssence: text.optional(),
    prayerProgress: text.optional(),
    dailyBuyPattern: text.optional(),
    selectedPet: text.optional(),
    petStatus: text.optional(),
    relicProgress: text.optional(),
    goddessStatues: text.optional(),
    shopRoutine: text.optional(),
    customQuestion: z.string().max(4000).optional(),
    gearSummary: z.string().max(200).optional(),
    level: z.number().int().min(1).max(400).optional(),
    totalJobLevel: z.number().int().min(0).max(400).optional(),
    warriorJobLevel: z.number().int().min(0).max(400).optional(),
    mageJobLevel: z.number().int().min(0).max(400).optional(),
    duelistJobLevel: z.number().int().min(0).max(400).optional(),
    normalPrayerTickets: z.number().int().min(0).optional(),
    classPrayerTickets: z.number().int().min(0).optional(),
    skillSelectTickets: z.number().int().min(0).optional(),
    secretRealmTotal: z.number().int().min(0).optional(),
    hammerStone: z.number().int().min(0).optional(),
    pickaxeGold: z.number().int().min(0).optional(),
    gloveEssence: z.number().int().min(0).optional(),
    shovelSand: z.number().int().min(0).optional(),
    fateFruits: z.number().int().min(0).optional(),
    timeCrystals: z.number().int().min(0).optional(),
    cartStoneLv: z.number().int().min(0).max(400).optional(),
    cartOreLv: z.number().int().min(0).max(400).optional(),
    cartWoodLv: z.number().int().min(0).max(400).optional(),
    cartSandLv: z.number().int().min(0).max(400).optional(),
    cartOtherLv: z.number().int().min(0).max(400).optional(),
    bedLv: z.number().int().min(0).max(400).optional(),
  })
  .strict();

export async function updateCharacter(id: string, patch: unknown) {
  const parsed = patchSchema.parse(patch);
  await requirePermission('sxs.use');
  const supabase = await createClient();

  if (parsed.name !== undefined) {
    const { error } = await supabase
      .from('sxs_characters')
      .update({ name: parsed.name, updated_at: new Date().toISOString() })
      .eq('id', id);
    fail(error);
  }

  const hasProfileField = Object.entries(parsed).some(([key]) => key !== 'name');
  if (hasProfileField) {
    await mutateDoc(id, (doc) => {
      for (const [key, column] of Object.entries(TEXT_FIELDS)) {
        if (key === 'name') continue;
        const value = parsed[key as keyof typeof parsed];
        if (typeof value === 'string') {
          doc.character[column as keyof typeof doc.character] = value as never;
        }
      }
      for (const [key, column] of Object.entries(NUMBER_FIELDS)) {
        const value = parsed[key as keyof typeof parsed];
        if (typeof value === 'number') {
          doc.character[column as keyof typeof doc.character] = value as never;
        }
      }
    });
  }

  refresh(id);
}

async function firstServerId(): Promise<string> {
  const user = await requirePermission('sxs.use');
  const supabase = await createClient();

  const listed = await supabase
    .from('sxs_servers')
    .select('id')
    .order('opened_on', { ascending: true })
    .limit(1);
  fail(listed.error);
  if (listed.data?.[0]) return listed.data[0].id;

  const created = await supabase
    .from('sxs_servers')
    .insert({
      user_id: user.id,
      name: 'Default',
      opened_on: shiftCalendarDay(-3),
    })
    .select('id')
    .single();
  fail(created.error);
  if (!created.data) throw new Error('Không tạo được server');
  return created.data.id;
}

export async function ensureStarter(): Promise<string> {
  const user = await requirePermission('sxs.use');
  const supabase = await createClient();

  const existing = await supabase
    .from('sxs_characters')
    .select('id')
    .order('last_opened_at', { ascending: false })
    .limit(1);
  fail(existing.error);
  if (existing.data?.[0]) return existing.data[0].id;

  const serverId = await firstServerId();
  const doc = starterDoc();
  const created = await supabase
    .from('sxs_characters')
    .insert({
      user_id: user.id,
      name: 'Aquariuss',
      server_id: serverId,
      data: doc,
    })
    .select('id')
    .single();
  fail(created.error);
  if (!created.data) throw new Error('Không tạo được nhân vật');
  // No revalidatePath: called while rendering the list page, which reads fresh data right after.
  return created.data.id;
}

export async function createBlankCharacter(name: string, serverId: string): Promise<string> {
  const user = await requirePermission('sxs.use');
  const validName = z.string().min(1).max(80).parse(name);
  const validServerId = z.string().uuid().parse(serverId);
  const supabase = await createClient();

  const created = await supabase
    .from('sxs_characters')
    .insert({
      user_id: user.id,
      name: validName,
      server_id: validServerId,
      data: blankDoc(),
    })
    .select('id')
    .single();
  fail(created.error);
  if (!created.data) throw new Error('Không tạo được nhân vật');

  refresh();
  return created.data.id;
}

export async function duplicateCharacter(id: string, name: string): Promise<string> {
  const user = await requirePermission('sxs.use');
  const validName = z.string().min(1).max(80).parse(name);
  const supabase = await createClient();

  const source = await supabase
    .from('sxs_characters')
    .select('server_id, data')
    .eq('id', id)
    .single();
  fail(source.error);
  if (!source.data) throw new Error('Character not found');

  const created = await supabase
    .from('sxs_characters')
    .insert({
      user_id: user.id,
      name: validName,
      server_id: source.data.server_id,
      data: source.data.data,
    })
    .select('id')
    .single();
  fail(created.error);
  if (!created.data) throw new Error('Không duplicate được nhân vật');

  refresh();
  return created.data.id;
}

export async function deleteCharacter(id: string): Promise<void> {
  await requirePermission('sxs.use');
  const supabase = await createClient();
  fail((await supabase.from('sxs_characters').delete().eq('id', id)).error);
  refresh();
}

export async function exportCharacter(id: string): Promise<CharacterDoc> {
  await requirePermission('sxs.use');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sxs_characters')
    .select('data')
    .eq('id', id)
    .single();
  fail(error);
  if (!data) throw new Error('Character not found');
  return characterDocSchema.parse(data.data);
}

export async function importCharacter(id: string, raw: unknown): Promise<void> {
  await requirePermission('sxs.use');
  const doc = characterDocSchema.parse(raw);
  const supabase = await createClient();
  fail(
    (
      await supabase
        .from('sxs_characters')
        .update({ data: doc, updated_at: new Date().toISOString() })
        .eq('id', id)
    ).error,
  );
  refresh(id);
}

const skillPatch = z.object({
  owned: z.boolean().optional(),
  quality: z.enum(QUALITIES).optional(),
  stars: z.number().int().min(0).max(10).optional(),
  equippedSlot: z.number().int().min(0).max(4).optional(),
});

function clearSlotInDoc(doc: CharacterDoc, skillType: 'active' | 'passive', slot: number) {
  const catalogTypeMap = new Map(catalogData.skills.map((s) => [s.id, s.skill_type]));

  doc.skills.forEach((s) => {
    if (s.equipped_slot === slot && catalogTypeMap.get(s.skill_id) === skillType) {
      s.equipped_slot = 0;
    }
  });

  doc.custom_skills.forEach((s) => {
    if (s.equipped_slot === slot && s.skill_type === skillType) {
      s.equipped_slot = 0;
    }
  });
}

export async function updateSkill(
  characterId: string,
  skillId: string,
  skillType: 'active' | 'passive',
  patch: unknown,
) {
  const parsed = skillPatch.parse(patch);
  await mutateDoc(characterId, (doc) => {
    if (parsed.equippedSlot && parsed.equippedSlot > 0) {
      clearSlotInDoc(doc, skillType, parsed.equippedSlot);
    }
    const existing = doc.skills.find((s) => s.skill_id === skillId);
    if (existing) {
      if (parsed.owned !== undefined) existing.owned = parsed.owned;
      if (parsed.quality !== undefined) existing.quality = parsed.quality;
      if (parsed.stars !== undefined) existing.stars = parsed.stars;
      if (parsed.equippedSlot !== undefined) existing.equipped_slot = parsed.equippedSlot;
    } else {
      doc.skills.push({
        skill_id: skillId,
        owned: parsed.owned ?? true,
        quality: parsed.quality ?? 'Epic',
        stars: parsed.stars ?? 1,
        equipped_slot: parsed.equippedSlot ?? 0,
      });
    }
  });
  refresh(characterId);
}

export async function updateCustomSkill(characterId: string, id: string, patch: unknown) {
  const parsed = skillPatch.parse(patch);
  await mutateDoc(characterId, (doc) => {
    const existing = doc.custom_skills.find((s) => s.id === id);
    if (!existing) throw new Error('Không thấy kỹ năng');
    if (parsed.equippedSlot && parsed.equippedSlot > 0) {
      clearSlotInDoc(doc, existing.skill_type, parsed.equippedSlot);
    }
    if (parsed.owned !== undefined) existing.owned = parsed.owned;
    if (parsed.quality !== undefined) existing.quality = parsed.quality;
    if (parsed.stars !== undefined) existing.stars = parsed.stars;
    if (parsed.equippedSlot !== undefined) existing.equipped_slot = parsed.equippedSlot;
  });
  refresh(characterId);
}

export async function addCustomSkill(characterId: string, input: unknown) {
  const parsed = z
    .object({
      vn: z.string().min(1).max(80),
      en: z.string().max(80).optional(),
      tierClass: z.string().min(1).max(8),
      skillType: z.enum(['active', 'passive']),
    })
    .parse(input);

  await mutateDoc(characterId, (doc) => {
    doc.custom_skills.push({
      id: crypto.randomUUID(),
      vn: parsed.vn,
      en: parsed.en || 'Custom Skill',
      cn: '自定义',
      tier_class: parsed.tierClass,
      skill_type: parsed.skillType,
      element: 'Physical',
      cd: parsed.skillType === 'active' ? '1 Turn' : 'Charm',
      tier: 'A',
      description: 'Kỹ năng người chơi tự bổ sung.',
      icon_key: 'duelist_hero',
      owned: true,
      quality: 'Legendary',
      stars: 1,
      equipped_slot: 0,
    });
  });
  refresh(characterId);
}

export async function addCompanion(characterId: string, companionId: string) {
  const id = z.string().min(1).max(80).parse(companionId);
  await mutateDoc(characterId, (doc) => {
    const existing = doc.companions.find((c) => c.companion_id === id);
    if (!existing) {
      doc.companions.push({
        companion_id: id,
        level: 0,
        priority: '',
      });
    }
  });
  refresh(characterId);
}

export async function updateCompanion(characterId: string, companionId: string, level: number) {
  const lv = z.number().int().min(0).max(200).parse(level);
  await mutateDoc(characterId, (doc) => {
    const existing = doc.companions.find((c) => c.companion_id === companionId);
    if (existing) {
      existing.level = lv;
    } else {
      doc.companions.push({
        companion_id: companionId,
        level: lv,
        priority: '',
      });
    }
  });
  refresh(characterId);
}

const fantomonPatchSchema = z.object({
  owned: z.boolean().optional(),
  quality: z.enum(QUALITIES).optional(),
  stars: z.number().int().min(0).max(5).optional(),
  equippedSlot: z.number().int().min(0).max(4).optional(),
});

export async function updateFantomon(characterId: string, fantomonId: string, patch: unknown) {
  const parsed = fantomonPatchSchema.parse(patch);
  await mutateDoc(characterId, (doc) => {
    if (parsed.equippedSlot && parsed.equippedSlot > 0) {
      doc.fantomons.forEach((f) => {
        if (f.equipped_slot === parsed.equippedSlot) {
          f.equipped_slot = 0;
        }
      });
    }
    const existing = doc.fantomons.find((f) => f.fantomon_id === fantomonId);
    if (existing) {
      if (parsed.owned !== undefined) existing.owned = parsed.owned;
      if (parsed.quality !== undefined) existing.quality = parsed.quality;
      if (parsed.stars !== undefined) existing.stars = parsed.stars;
      if (parsed.equippedSlot !== undefined) existing.equipped_slot = parsed.equippedSlot;
    } else {
      doc.fantomons.push({
        fantomon_id: fantomonId,
        owned: parsed.owned ?? true,
        quality: parsed.quality ?? 'Epic',
        stars: parsed.stars ?? 1,
        equipped_slot: parsed.equippedSlot ?? 0,
      });
    }
  });
  refresh(characterId);
}

export async function createServer(name: string, openedOn: string): Promise<string> {
  const parsed = z
    .object({
      name: z.string().min(1).max(80),
      openedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .parse({ name, openedOn });

  const user = await requirePermission('sxs.use');
  const supabase = await createClient();

  const created = await supabase
    .from('sxs_servers')
    .insert({
      user_id: user.id,
      name: parsed.name,
      opened_on: parsed.openedOn,
    })
    .select('id')
    .single();
  fail(created.error);
  if (!created.data) throw new Error('Không tạo được server');

  revalidatePath('/admin/sxs');
  return created.data.id;
}

export async function assignServer(characterId: string, serverId: string): Promise<void> {
  await requirePermission('sxs.use');
  const validServerId = z.string().uuid().parse(serverId);
  const supabase = await createClient();

  fail(
    (
      await supabase
        .from('sxs_characters')
        .update({ server_id: validServerId, updated_at: new Date().toISOString() })
        .eq('id', characterId)
    ).error,
  );

  refresh(characterId);
}

export async function updateServerOpenedOn(serverId: string, openedOn: string): Promise<void> {
  await requirePermission('sxs.use');
  const validServerId = z.string().uuid().parse(serverId);
  const validOpenedOn = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .parse(openedOn);
  const supabase = await createClient();

  fail(
    (
      await supabase
        .from('sxs_servers')
        .update({ opened_on: validOpenedOn })
        .eq('id', validServerId)
    ).error,
  );

  revalidatePath('/admin/sxs', 'layout');
  revalidatePath('/admin/sxs');
}
