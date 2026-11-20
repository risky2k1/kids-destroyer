import { z } from 'zod';
import starterJson from './starter.json';

export const characterProfileDocSchema = z.object({
  level: z.number().int().min(1).max(500).default(1),
  combat_power: z.string().max(2000).default('0'),
  current_class: z.string().max(2000).default('Warrior'),
  rank_tier: z.string().max(2000).default(''),
  total_job_level: z.number().int().min(0).max(500).default(1),
  warrior_job_level: z.number().int().min(0).max(500).default(1),
  mage_job_level: z.number().int().min(0).max(500).default(0),
  duelist_job_level: z.number().int().min(0).max(500).default(0),
  current_map: z.string().max(2000).default(''),
  mirage_tower: z.string().max(2000).default(''),
  daily_dungeon_status: z.string().max(2000).default(''),
  spending_tier: z.string().max(2000).default('F2P'),
  gold: z.string().max(2000).default('0'),
  morning_star: z.string().max(2000).default('0'),
  colored_diamond: z.string().max(2000).default('0'),
  stamina: z.string().max(2000).default('0'),
  battle_essence: z.string().max(2000).default('0'),
  normal_prayer_tickets: z.number().int().min(0).default(0),
  class_prayer_tickets: z.number().int().min(0).default(0),
  skill_select_tickets: z.number().int().min(0).default(0),
  prayer_progress: z.string().max(2000).default(''),
  secret_realm_total: z.number().int().min(0).default(0),
  hammer_stone: z.number().int().min(0).default(0),
  pickaxe_gold: z.number().int().min(0).default(0),
  glove_essence: z.number().int().min(0).default(0),
  shovel_sand: z.number().int().min(0).default(0),
  daily_buy_pattern: z.string().max(2000).default(''),
  fate_fruits: z.number().int().min(0).default(0),
  time_crystals: z.number().int().min(0).default(0),
  selected_pet: z.string().max(2000).default(''),
  pet_status: z.string().max(2000).default(''),
  relic_progress: z.string().max(2000).default(''),
  cart_stone_lv: z.number().int().min(0).max(500).default(1),
  cart_ore_lv: z.number().int().min(0).max(500).default(1),
  cart_wood_lv: z.number().int().min(0).max(500).default(1),
  cart_sand_lv: z.number().int().min(0).max(500).default(1),
  cart_other_lv: z.number().int().min(0).max(500).default(1),
  bed_lv: z.number().int().min(0).max(500).default(1),
  goddess_statues: z.string().max(2000).default(''),
  shop_routine: z.string().max(2000).default(''),
  custom_question: z.string().max(4000).default(''),
  gear_summary: z.string().max(200).default(''),
  server_day: z.number().int().optional(),
});

export const equipmentDocSchema = z.object({
  slot_key: z.string().max(100),
  name: z.string().max(2000),
  icon_key: z.string().max(2000).default(''),
  level: z.number().int().min(0).max(500).default(0),
  quality: z.string().max(100).default('Rare'),
  notes: z.string().max(2000).default(''),
});

export const skillSlotDocSchema = z.object({
  slot_index: z.number().int().min(1).max(50),
  slot_kind: z.string().max(100),
  level: z.number().int().min(1).max(500).default(1),
});

export const skillStateDocSchema = z.object({
  skill_id: z.string().max(200),
  owned: z.boolean().default(true),
  quality: z.string().max(100).default('Epic'),
  stars: z.number().int().min(0).max(20).default(1),
  equipped_slot: z.number().int().min(0).max(10).default(0),
});

export const customSkillDocSchema = z.object({
  id: z.string().max(200).optional(),
  vn: z.string().max(200),
  en: z.string().max(200).default(''),
  cn: z.string().max(200).default(''),
  tier_class: z.string().max(100).default('R1'),
  skill_type: z.enum(['active', 'passive']),
  element: z.string().max(100).default('Physical'),
  cd: z.string().max(100).default(''),
  tier: z.string().max(50).default('A'),
  description: z.string().max(2000).default(''),
  icon_key: z.string().max(200).default(''),
  owned: z.boolean().default(true),
  quality: z.string().max(100).default('Epic'),
  stars: z.number().int().min(0).max(20).default(1),
  equipped_slot: z.number().int().min(0).max(10).default(0),
});

export const companionDocSchema = z.object({
  companion_id: z.string().max(200),
  level: z.number().int().min(0).max(500).default(0),
  priority: z.string().max(2000).default(''),
});

export const fantomonDocSchema = z.object({
  fantomon_id: z.string().max(200),
  owned: z.boolean().default(false),
  quality: z.string().max(100).default('Epic'),
  stars: z.number().int().min(0).max(20).default(1),
  equipped_slot: z.number().int().min(0).max(10).default(0),
});

export const characterDocSchema = z.object({
  character: characterProfileDocSchema.default(() => characterProfileDocSchema.parse({})),
  equipment: z
    .array(equipmentDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
  skill_slots: z
    .array(skillSlotDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
  skills: z
    .array(skillStateDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
  custom_skills: z
    .array(customSkillDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
  companions: z
    .array(companionDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
  fantomons: z
    .array(fantomonDocSchema)
    .max(500)
    .nullish()
    .transform((v) => v ?? []),
});

export type CharacterProfileDoc = z.infer<typeof characterProfileDocSchema>;
export type EquipmentDoc = z.infer<typeof equipmentDocSchema>;
export type SkillSlotDoc = z.infer<typeof skillSlotDocSchema>;
export type SkillStateDoc = z.infer<typeof skillStateDocSchema>;
export type CustomSkillDoc = z.infer<typeof customSkillDocSchema>;
export type CompanionDoc = z.infer<typeof companionDocSchema>;
export type FantomonDoc = z.infer<typeof fantomonDocSchema>;
export type CharacterDoc = z.infer<typeof characterDocSchema>;

export function starterDoc(): CharacterDoc {
  const raw = starterJson as unknown as {
    character?: Record<string, unknown>;
    equipment?: unknown[];
    skill_slots?: unknown[];
    skills?: unknown[];
    companions?: unknown[];
  };
  const profile = { ...(raw.character ?? {}) };
  delete profile.name;
  delete profile.server_id;
  return characterDocSchema.parse({
    character: profile,
    equipment: raw.equipment ?? [],
    skill_slots: raw.skill_slots ?? [],
    skills: raw.skills ?? [],
    custom_skills: [],
    companions: raw.companions ?? [],
    fantomons: [],
  });
}

export function blankDoc(): CharacterDoc {
  const base = starterDoc();
  return {
    ...base,
    character: {
      ...base.character,
      level: 1,
      combat_power: '0',
      current_class: 'Warrior',
      rank_tier: '',
      total_job_level: 1,
      warrior_job_level: 1,
      mage_job_level: 0,
      duelist_job_level: 0,
      current_map: '',
      mirage_tower: '',
      daily_dungeon_status: '',
      spending_tier: 'F2P',
      gold: '0',
      morning_star: '0',
      colored_diamond: '0',
      stamina: '0',
      battle_essence: '0',
      normal_prayer_tickets: 0,
      class_prayer_tickets: 0,
      skill_select_tickets: 0,
      prayer_progress: '',
      secret_realm_total: 0,
      hammer_stone: 0,
      pickaxe_gold: 0,
      glove_essence: 0,
      shovel_sand: 0,
      daily_buy_pattern: '',
      fate_fruits: 0,
      time_crystals: 0,
      selected_pet: '',
      pet_status: '',
      relic_progress: '',
      cart_stone_lv: 1,
      cart_ore_lv: 1,
      cart_wood_lv: 1,
      cart_sand_lv: 1,
      cart_other_lv: 1,
      bed_lv: 1,
      goddess_statues: '',
      shop_routine: '',
      custom_question: '',
      gear_summary: '',
    },
    equipment: base.equipment.map((item) => ({
      ...item,
      level: 0,
      quality: 'Rare',
      notes: '',
    })),
    skill_slots: base.skill_slots.map((slot) => ({ ...slot, level: 1 })),
    skills: [],
    companions: base.companions.map((companion) => ({
      ...companion,
      level: 1,
      priority: '',
    })),
    custom_skills: [],
    fantomons: [],
  };
}
