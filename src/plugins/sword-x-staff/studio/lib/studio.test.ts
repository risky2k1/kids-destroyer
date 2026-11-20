import { describe, expect, it } from 'vitest';
import { resonance } from './resonance';
import { starterDoc } from './doc';

describe('resonance', () => {
  it('locks the milestone to the lowest piece, in steps of 5', () => {
    const result = resonance([38, 35, 35, 35, 35]);
    expect(result.current).toBe(35);
    expect(result.uneven).toBe(false);
  });

  it('warns when gear levels drift by more than 5', () => {
    expect(resonance([40, 30, 35, 35, 35]).uneven).toBe(true);
  });
});

describe('studio doc model', () => {
  it('assembles valid doc and preserves character state', () => {
    const doc = starterDoc();
    expect(doc.character.level).toBe(44);
    expect(doc.equipment.length).toBeGreaterThan(0);
    expect(doc.skill_slots.length).toBeGreaterThan(0);
    expect(doc.companions.length).toBeGreaterThan(0);
  });
});
