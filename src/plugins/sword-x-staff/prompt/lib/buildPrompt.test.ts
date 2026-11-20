import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { buildPrompt } from './buildPrompt';
import { type LegacySkill, mergeLegacy } from '@/plugins/sword-x-staff/studio';

const flame: LegacySkill = {
  id: 'r2_flame_aura',
  tierClass: 'R2',
  type: 'active',
  vn: 'Hỏa Diễm Tùy Thân',
  en: 'Flame Aura',
  cn: '火焰随身',
  cd: '1 Turn',
  element: 'Fire',
  tier: 'S+',
  desc: 'Aura',
};

describe('buildPrompt', () => {
  it('includes the character and the owned skill', () => {
    const prompt = buildPrompt(mergeLegacy({}), [flame]);
    expect(prompt).toContain('Aquariuss');
    expect(prompt).toContain('Flame Aura');
    expect(prompt).toContain('Set Huyền thoại +12, vũ khí Thần thoại');
    expect(prompt).toContain('1. PROFILE:');
    expect(prompt).toContain('2. GEAR:');
    expect(prompt).toContain('3. OWNED SKILLS:');
    expect(prompt).toContain('4. RESOURCES:');
    expect(prompt).toContain('5. COMPANIONS, FANTOMON & RELICS:');
    expect(prompt).not.toContain('Resonance');
    expect(prompt).not.toContain('HOME:');
    expect(prompt).not.toContain('EQUIPPED SKILLS:');
    expect(prompt).not.toContain('Rank:');
  });
});
