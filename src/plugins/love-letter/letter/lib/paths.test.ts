import { expect, it } from 'vitest';
import { LETTER_PATH } from './paths';

it('letter url is /for-you', () => {
  expect(LETTER_PATH).toBe('/for-you');
});
