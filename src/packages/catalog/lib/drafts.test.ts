import { describe, expect, it } from 'vitest';
import { changedRows } from './drafts';

const items = [
  { id: 'a', name: 'Toán', sort: 1 },
  { id: 'b', name: 'Tiếng Anh', sort: 2 },
];

describe('changedRows', () => {
  it('no drafts → nothing to save', () => expect(changedRows(items, {})).toEqual([]));
  it('edited back to original → unchanged', () =>
    expect(changedRows(items, { a: { name: 'Toán', sort: '1' } })).toEqual([]));
  it('returns only changed rows, in item order', () =>
    expect(
      changedRows(items, { b: { name: 'Anh', sort: '2' }, a: { name: 'Toán', sort: '3' } }),
    ).toEqual([
      { id: 'a', name: 'Toán', sort: '3' },
      { id: 'b', name: 'Anh', sort: '2' },
    ]));
  it('ignores drafts for rows that no longer exist', () =>
    expect(changedRows(items, { gone: { name: 'x', sort: '0' } })).toEqual([]));
});
