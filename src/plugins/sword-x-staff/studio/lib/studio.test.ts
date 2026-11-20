import { describe, expect, it } from 'vitest';
import { starterDoc } from './doc';

describe('studio doc model', () => {
  it('assembles valid doc and preserves character state', () => {
    const doc = starterDoc();
    expect(doc.character.level).toBe(44);
    expect(doc.equipment.length).toBeGreaterThan(0);
    expect(doc.skill_slots.length).toBeGreaterThan(0);
    expect(doc.companions.length).toBeGreaterThan(0);
  });
});
