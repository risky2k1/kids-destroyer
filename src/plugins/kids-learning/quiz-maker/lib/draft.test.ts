import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { validateDraftItems } from './draft';

const mcq = {
  type: 'mcq',
  prompt: '1+1',
  content: '{"options":["1","2"],"multiple":false}',
  answer: '{"correct":[1]}',
};

describe('validateDraftItems', () => {
  it('keeps a valid multiple-choice item', () => {
    const result = validateDraftItems([mcq], ['mcq']);
    expect(result.dropped).toBe(0);
    expect(result.items).toEqual([
      {
        type: 'mcq',
        prompt: '1+1',
        content: { options: ['1', '2'], multiple: false },
        answer: { correct: [1] },
      },
    ]);
  });

  it('drops an answer index that is out of range', () => {
    const result = validateDraftItems([{ ...mcq, answer: '{"correct":[5]}' }], ['mcq']);
    expect(result.items).toEqual([]);
    expect(result.dropped).toBe(1);
  });

  it('drops a type that was not allowed', () => {
    const result = validateDraftItems([mcq], ['number']);
    expect(result.items).toEqual([]);
    expect(result.dropped).toBe(1);
  });

  it('drops an item whose content is not json', () => {
    const result = validateDraftItems([{ ...mcq, content: '{' }], ['mcq']);
    expect(result.items).toEqual([]);
    expect(result.dropped).toBe(1);
  });

  it('returns nothing for a non-array', () => {
    expect(validateDraftItems({ items: [] }, ['mcq'])).toEqual({ items: [], dropped: 0 });
  });

  it('counts the dropped items', () => {
    const result = validateDraftItems(
      [mcq, { ...mcq, content: '{' }, { ...mcq, type: 'essay' }],
      ['mcq'],
    );
    expect(result.items).toHaveLength(1);
    expect(result.dropped).toBe(2);
  });
});
