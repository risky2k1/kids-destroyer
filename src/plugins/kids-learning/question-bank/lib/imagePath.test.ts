import { describe, expect, it } from 'vitest';
import { isOwnImagePath } from './imagePath';

const id = '11111111-1111-4111-8111-111111111111';

describe('isOwnImagePath', () => {
  it('accepts the caller’s own uuid file', () => {
    expect(isOwnImagePath(`u1/${id}.png`, 'u1')).toBe(true);
  });

  it('rejects another user’s folder', () => {
    expect(isOwnImagePath(`u2/${id}.png`, 'u1')).toBe(false);
  });

  it('rejects a path that leaves the folder', () => {
    expect(isOwnImagePath('u1/../x.png', 'u1')).toBe(false);
  });

  it('rejects an extension the bucket does not allow', () => {
    expect(isOwnImagePath(`u1/${id}.svg`, 'u1')).toBe(false);
  });
});
