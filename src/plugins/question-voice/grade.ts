import type { GradeResult } from '@/core/plugins';
import type { VoiceAnswer, VoiceContent, VoiceResponse } from './schema';

export function grade(
  content: VoiceContent,
  answer: VoiceAnswer,
  response: VoiceResponse,
): GradeResult {
  void content;
  void answer;
  void response;
  return {
    score: 0,
    needsManual: true,
  };
}
