import { describe, expect, it } from 'vitest';
import { questionImageUrl } from './image';

describe('questionImageUrl', () => {
  it('returns null when there is no image', () => {
    expect(questionImageUrl(null)).toBeNull();
  });

  it('points at the public question-images object', () => {
    expect(questionImageUrl('u/a.png')).toMatch(
      /\/storage\/v1\/object\/public\/question-images\/u\/a.png$/,
    );
  });
});
