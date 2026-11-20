import type { LegacySkill, LegacyState, SkillState } from '@/plugins/sword-x-staff/studio';

const EMPTY: SkillState = {
  owned: false,
  quality: 'Epic',
  stars: 1,
  equippedSlot: 0,
};

function skillState(state: LegacyState, id: string): SkillState {
  return state.skills[id] ?? EMPTY;
}

function catalog(state: LegacyState, extra: LegacySkill[]) {
  return [...extra, ...(state.customSkillsList ?? [])];
}

function profileSection(state: LegacyState) {
  const p = state.profile;
  return [
    '1. PROFILE:',
    `- Character: ${p.playerName} | Server Day ${p.serverDay} | Level: Lv.${p.level} | Total Power: ${p.combatPower} | Class: ${p.currentClass} | Spending: ${p.spendingTier}`,
  ].join('\n');
}

function gearSection(state: LegacyState) {
  const summary = state.gearSummary || state.profile.gearSummary || '(none)';
  return ['2. GEAR:', `- ${summary}`].join('\n');
}

function ownedSkillsSection(state: LegacyState, skills: LegacySkill[]) {
  const lines = skills
    .filter((skill) => skillState(state, skill.id).owned)
    .map((skill) => {
      const owned = skillState(state, skill.id);
      const kind = skill.type === 'active' ? 'Technique' : 'Charm';
      return `  - [${skill.tierClass} - ${kind}] ${skill.en}: ${owned.quality} ${owned.stars}★ (Tier ${skill.tier})`;
    });
  return ['3. OWNED SKILLS:', lines.join('\n') || '  - (none)'].join('\n');
}

function resourceSection(state: LegacyState) {
  const r = state.resources;
  return [
    '4. RESOURCES:',
    `- Dawnium: ${r.morningStar} | Stellatie: ${r.normalPrayerTickets} | Covenite: ${r.classPrayerTickets} | Skill Shard Voucher: ${r.skillSelectTickets} | Destiny Fruit: ${r.fateFruits} | Temporal Crystal: ${r.timeCrystals}`,
  ].join('\n');
}

export function buildPrompt(state: LegacyState, extra: LegacySkill[]): string {
  const skills = catalog(state, extra);
  const companions = state.companionsPets.companions
    .map(
      (item) =>
        `  - ${item.name} (Gift: ${item.giftType}): Affection ${item.level} [${item.stats}]`,
    )
    .join('\n');
  return [
    '=== BÁO CÁO TRẠNG THÁI TÀI KHOẢN SWORD X STAFF (杖剑传说) ===',
    '',
    profileSection(state),
    '',
    gearSection(state),
    '',
    ownedSkillsSection(state, skills),
    '',
    resourceSection(state),
    '',
    '5. COMPANIONS, FANTOMON & RELICS:',
    companions,
    `- Fantomon: ${state.companionsPets.petStatus}`,
    `- Relics: ${state.companionsPets.relicProgress}`,
    '',
    '=== YÊU CẦU PHÂN TÍCH & TƯ VẤN LỘ TRÌNH ===',
    state.customQuestion,
  ].join('\n');
}
