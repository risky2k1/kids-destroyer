import { describe, expect, it } from 'vitest';

import type { Studio } from '@/plugins/sword-x-staff/studio';
import { mergeSkills } from './mergeSkills';

describe('mergeSkills', () => {
  it('merges catalog skills and saved state, allowing 0 stars', () => {
    const studio = {
      skills: [
        {
          character_id: 'c1',
          skill_id: 'slash',
          owned: true,
          quality: 'Legendary',
          stars: 0,
          equipped_slot: 0,
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
      ],
    } as unknown as Studio;

    const merged = mergeSkills(studio);
    expect(merged[0].stars).toBe(0);
    expect(merged[0].owned).toBe(true);
    expect(merged[0].quality).toBe('Legendary');
  });
});
