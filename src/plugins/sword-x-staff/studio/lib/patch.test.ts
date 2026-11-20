import { describe, expect, it } from 'vitest';
import type { Studio } from '../types';
import { patchCatalogSkill, patchCharacter, patchServerOpenedOn } from './patch';

function studio(): Studio {
  return {
    character: {
      id: 'c1',
      user_id: 'u1',
      name: 'Test',
      server_id: 's1',
      servers: { id: 's1', name: 'A', opened_on: '2026-01-01' },
      morning_star: '1',
    },
    skills: [
      {
        character_id: 'c1',
        skill_id: 'slash',
        owned: false,
        quality: 'Epic',
        stars: 1,
        equipped_slot: 1,
      },
      {
        character_id: 'c1',
        skill_id: 'guard',
        owned: true,
        quality: 'Epic',
        stars: 1,
        equipped_slot: 1,
      },
    ],
    customSkills: [],
    catalog: [
      {
        id: 'slash',
        tier_class: 'R1',
        skill_type: 'active',
        vn: 'Xoáy Kiếm',
        en: 'Whirlwind Slash',
        cn: '旋风斩',
        cd: '1 Turn',
        element: 'Physical',
        tier: 'S+',
        description: 'Test',
        icon_key: 'slash',
      },
      {
        id: 'guard',
        tier_class: 'R1',
        skill_type: 'passive',
        vn: 'Phòng Ngự',
        en: 'Guard',
        cn: '防御',
        cd: '',
        element: 'Physical',
        tier: 'A',
        description: 'Test',
        icon_key: 'guard',
      },
      {
        id: 'bash',
        tier_class: 'R1',
        skill_type: 'active',
        vn: 'Đập',
        en: 'Bash',
        cn: '重击',
        cd: '1 Turn',
        element: 'Physical',
        tier: 'A',
        description: 'Test',
        icon_key: 'bash',
      },
    ],
    equipment: [],
    skillSlots: [],
    companions: [],
    fantomons: [],
    characters: [],
    servers: [],
  } as unknown as Studio;
}

describe('patchCatalogSkill', () => {
  it('marks a skill owned before the server answers', () => {
    const next = patchCatalogSkill(studio(), 'slash', 'active', {
      owned: true,
    });
    expect(next.skills.find((row) => row.skill_id === 'slash')?.owned).toBe(true);
  });

  it('clears another skill already sitting in the slot', () => {
    const next = patchCatalogSkill(studio(), 'bash', 'active', {
      equippedSlot: 1,
      owned: true,
    });
    expect(next.skills.find((row) => row.skill_id === 'slash')?.equipped_slot).toBe(0);
    expect(next.skills.find((row) => row.skill_id === 'guard')?.equipped_slot).toBe(1);
    expect(next.skills.find((row) => row.skill_id === 'bash')?.equipped_slot).toBe(1);
  });
});

describe('patchCharacter', () => {
  it('updates the header field immediately', () => {
    const next = patchCharacter(studio(), { morningStar: '9', gearSummary: 'New Set +15' });
    expect(next.character.morning_star).toBe('9');
    expect(next.character.gear_summary).toBe('New Set +15');
  });
});

describe('patchServerOpenedOn', () => {
  it('updates opened_on on both servers and character', () => {
    const s = studio();
    s.servers = [{ id: 's1', name: 'A', opened_on: '2026-01-01' }];
    const next = patchServerOpenedOn(s, 's1', '2026-02-15');
    expect(next.servers[0].opened_on).toBe('2026-02-15');
    expect(next.character.servers?.opened_on).toBe('2026-02-15');
  });
});
