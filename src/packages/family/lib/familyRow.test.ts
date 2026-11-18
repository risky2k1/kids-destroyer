import { describe, expect, it } from 'vitest';
import { familyRow } from './familyRow';

describe('familyRow', () => {
  it('maps an empty family to empty chips', () => {
    expect(familyRow({ id: '1', name: 'Nhà A', profiles: null, kids: null })).toEqual({
      id: '1',
      name: 'Nhà A',
      parents: [],
      kids: [],
      grades: [],
    });
  });

  it('keeps kids in order and grades unique, first-seen', () => {
    expect(
      familyRow({
        id: '1',
        name: 'Nhà A',
        profiles: [{ display_name: 'Mẹ' }],
        kids: [
          { display_name: 'Na', grades: { name: 'Lớp 2' } },
          { display_name: 'Bo', grades: { name: 'Lớp 2' } },
        ],
      }),
    ).toEqual({
      id: '1',
      name: 'Nhà A',
      parents: ['Mẹ'],
      kids: ['Na', 'Bo'],
      grades: ['Lớp 2'],
    });
  });
});
