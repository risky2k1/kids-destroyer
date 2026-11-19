import { describe, expect, it } from 'vitest';
import { grade } from './grade';
import type { VoiceAnswer, VoiceContent, VoiceResponse } from './schema';

describe('question-voice grade', () => {
  const content: VoiceContent = { maxSeconds: 60 };
  const answer: VoiceAnswer = { hint: 'Bé đọc to, rõ ràng từng từ.' };
  const response: VoiceResponse = {
    path: '11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.webm',
  };

  it('always returns score 0 and needsManual true', () => {
    const result = grade(content, answer, response);
    expect(result).toEqual({ score: 0, needsManual: true });
  });
});
