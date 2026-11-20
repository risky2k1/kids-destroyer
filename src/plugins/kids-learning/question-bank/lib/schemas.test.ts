import { describe, expect, it } from 'vitest';
import { questionMeta } from './schemas';

const valid = {
  type: 'mcq',
  subjectId: '550e8400-e29b-41d4-a716-446655440000',
  gradeId: '550e8400-e29b-41d4-a716-446655440001',
  topicId: null,
  lang: 'vi',
  prompt: 'Một cộng một',
};

describe('questionMeta', () => {
  it('parses a valid question', () => {
    expect(questionMeta.parse(valid)).toMatchObject({ prompt: 'Một cộng một', lang: 'vi' });
  });

  it('asks for a prompt', () => {
    const parsed = questionMeta.safeParse({ ...valid, prompt: '   ' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0].message).toBe('Nhập đề bài');
  });

  it('rejects an unknown language', () => {
    expect(questionMeta.safeParse({ ...valid, lang: 'fr' }).success).toBe(false);
  });
});
