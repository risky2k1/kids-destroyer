import { expect, it } from 'vitest';
import { PLACES_PATHS } from './paths';
import { placeSaveTarget } from './saveTarget';

const id = '11111111-1111-4111-8111-111111111111';

it('index leaves the edit page', () => {
  expect(placeSaveTarget('index', id, false)).toBe(PLACES_PATHS.admin);
});

it('edit stays on an existing place and opens a new one after create', () => {
  expect(placeSaveTarget('edit', id, false)).toBeNull();
  expect(placeSaveTarget('edit', id, true)).toBe(PLACES_PATHS.edit(id));
  expect(placeSaveTarget('new', id, true)).toBe(PLACES_PATHS.new);
  expect(placeSaveTarget(null, id, true)).toBe(PLACES_PATHS.edit(id));
});
