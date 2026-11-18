import { describe, expect, it } from 'vitest';
import { grade } from './grade';

describe('fill grade', () => {
  it('ignores case and extra spaces but keeps Vietnamese diacritics', () => {
    expect(
      grade({ text: '[[]] và [[]]' }, { blanks: [['bốn'], ['Hai']] }, { values: ['  BỐN ', 'hai'] })
        .score,
    ).toBe(1);
  });

  it('does not match a diacritic-stripped answer', () => {
    expect(
      grade({ text: '[[]] và [[]]' }, { blanks: [['bốn'], ['hai']] }, { values: ['bon', 'hai'] })
        .score,
    ).toBe(0.5);
  });
});
