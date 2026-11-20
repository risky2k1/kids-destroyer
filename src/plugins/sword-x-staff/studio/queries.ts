import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';

import { requirePermission } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { characterDocSchema } from './lib/doc';
import catalogData from './lib/catalog.json';
import type {
  CatalogSkill,
  CharacterRow,
  CharacterSummary,
  CompanionRow,
  CustomSkillRow,
  EquipmentRow,
  FantomonCard,
  GameServer,
  SkillSlotRow,
  SkillStateRow,
  Studio,
} from './types';

export const loadStudio = cache(async (id: string): Promise<Studio> => {
  await requirePermission('sxs.use');
  const supabase = await createClient();

  const [charRes, , charsRes, serversRes] = await Promise.all([
    supabase.from('sxs_characters').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('sxs_characters')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', id),
    supabase
      .from('sxs_characters')
      .select('id, name, server_id')
      .order('last_opened_at', { ascending: false }),
    supabase
      .from('sxs_servers')
      .select('id, name, opened_on')
      .order('opened_on', { ascending: true }),
  ]);

  if (!charRes.data) notFound();

  const charRow = charRes.data;
  const doc = characterDocSchema.parse(charRow.data);

  const servers: GameServer[] = (serversRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    opened_on: s.opened_on,
  }));

  const server = servers.find((s) => s.id === charRow.server_id) ?? null;

  const character: CharacterRow = {
    id: charRow.id,
    user_id: charRow.user_id,
    name: charRow.name,
    server_id: charRow.server_id ?? '',
    servers: server,
    ...doc.character,
  };

  const equipment: EquipmentRow[] = doc.equipment.map((e) => ({
    character_id: charRow.id,
    slot_key: e.slot_key,
    name: e.name,
    icon_key: e.icon_key,
    level: e.level,
    quality: e.quality,
    notes: e.notes,
  }));

  const skillSlots: SkillSlotRow[] = doc.skill_slots.map((s) => ({
    character_id: charRow.id,
    slot_index: s.slot_index,
    slot_kind: s.slot_kind,
    level: s.level,
  }));

  const skills: SkillStateRow[] = doc.skills.map((s) => ({
    character_id: charRow.id,
    skill_id: s.skill_id,
    owned: s.owned,
    quality: s.quality,
    stars: s.stars,
    equipped_slot: s.equipped_slot,
  }));

  const customSkills: CustomSkillRow[] = doc.custom_skills.map((s, idx) => ({
    id: s.id || `custom-${idx}`,
    character_id: charRow.id,
    vn: s.vn,
    en: s.en ?? '',
    cn: s.cn ?? '',
    tier_class: s.tier_class,
    skill_type: s.skill_type,
    element: s.element ?? 'Physical',
    cd: s.cd ?? '',
    tier: s.tier ?? 'A',
    description: s.description ?? '',
    icon_key: s.icon_key ?? '',
    owned: s.owned ?? true,
    quality: s.quality ?? 'Epic',
    stars: s.stars ?? 1,
    equipped_slot: s.equipped_slot ?? 0,
  }));

  const savedCompanions = new Map(doc.companions.map((c) => [c.companion_id, c]));
  const companions: CompanionRow[] = catalogData.companions.map((def) => {
    const saved = savedCompanions.get(def.id);
    return {
      character_id: charRow.id,
      companion_id: def.id,
      level: saved?.level ?? 0,
      priority: saved?.priority ?? '',
      name: def.name,
      gift_type: def.gift_type,
      stats: def.stats,
      icon_key:
        'icon_key' in def && typeof def.icon_key === 'string' && def.icon_key
          ? def.icon_key
          : `companion_${def.id}`,
      opened: Boolean(saved),
    };
  });

  const savedFantomons = new Map(doc.fantomons.map((f) => [f.fantomon_id, f]));
  const fantomons: FantomonCard[] = catalogData.fantomons.map((cat) => {
    const state = savedFantomons.get(cat.id);
    return {
      id: cat.id,
      name: cat.name,
      role: cat.role,
      iconKey: cat.icon_key,
      owned: state?.owned ?? false,
      quality: state?.quality ?? 'Epic',
      stars: state?.stars ?? 1,
      equippedSlot: state?.equipped_slot ?? 0,
    };
  });

  const characters: CharacterSummary[] = (charsRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    server_id: c.server_id ?? '',
  }));

  return {
    character,
    equipment,
    skillSlots,
    skills,
    customSkills,
    companions,
    fantomons,
    catalog: catalogData.skills as CatalogSkill[],
    characters,
    servers,
  };
});

export async function listCharacters(): Promise<CharacterSummary[]> {
  await requirePermission('sxs.use');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sxs_characters')
    .select('id, name, server_id')
    .order('last_opened_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    server_id: c.server_id ?? '',
  }));
}

export async function listServers(): Promise<GameServer[]> {
  await requirePermission('sxs.use');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sxs_servers')
    .select('id, name, opened_on')
    .order('opened_on', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    opened_on: s.opened_on,
  }));
}
