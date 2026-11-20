import { describe, expect, it } from 'vitest';
import { characterDocSchema, starterDoc } from './doc';

describe('doc schema and starterDoc', () => {
  it('parses starterDoc successfully', () => {
    const doc = starterDoc();
    const parsed = characterDocSchema.parse(doc);
    expect(parsed.character.level).toBe(44);
    expect(parsed.character.combat_power).toBe('68.5K');
    expect(parsed.equipment.length).toBe(5);
    expect(parsed.skill_slots.length).toBe(8);
    expect(parsed.companions.length).toBe(5);
    expect(parsed.custom_skills).toEqual([]);
    expect(parsed.fantomons).toEqual([]);
  });

  it('defaults missing arrays to empty arrays', () => {
    const minimal = {
      character: {
        level: 10,
        current_class: 'Mage',
      },
    };
    const parsed = characterDocSchema.parse(minimal);
    expect(parsed.character.level).toBe(10);
    expect(parsed.character.current_class).toBe('Mage');
    expect(parsed.equipment).toEqual([]);
    expect(parsed.skill_slots).toEqual([]);
    expect(parsed.skills).toEqual([]);
    expect(parsed.custom_skills).toEqual([]);
    expect(parsed.companions).toEqual([]);
    expect(parsed.fantomons).toEqual([]);
  });

  it('rejects non-object garbage', () => {
    expect(() => characterDocSchema.parse('not-a-doc')).toThrow();
    expect(() => characterDocSchema.parse(12345)).toThrow();
    expect(() => characterDocSchema.parse(null)).toThrow();
  });

  it('rejects invalid types in character profile', () => {
    expect(() =>
      characterDocSchema.parse({
        character: {
          level: 'ten', // should be number
        },
      }),
    ).toThrow();
  });

  it('rejects out of bounds level in character profile', () => {
    expect(() =>
      characterDocSchema.parse({
        character: {
          level: 0, // min is 1
        },
      }),
    ).toThrow();
    expect(() =>
      characterDocSchema.parse({
        character: {
          level: 9999, // max is 500
        },
      }),
    ).toThrow();
  });

  it('rejects oversized strings', () => {
    const oversized = 'a'.repeat(2500);
    expect(() =>
      characterDocSchema.parse({
        character: {
          current_map: oversized,
        },
      }),
    ).toThrow();
  });

  it('rejects bounded arrays with >500 items', () => {
    const excessiveEquipment = Array.from({ length: 501 }, (_, i) => ({
      slot_key: `slot_${i}`,
      name: `Gear ${i}`,
    }));

    expect(() =>
      characterDocSchema.parse({
        equipment: excessiveEquipment,
      }),
    ).toThrow();
  });
});
