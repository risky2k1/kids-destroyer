import type { QuestionTypePlugin } from '@/plugins/kids-learning/question-types';
import { Editor } from './Editor';
import { grade } from './grade';
import { Player } from './Player';
import { Review } from './Review';
import {
  voiceAnswer,
  voiceContent,
  voiceResponse,
  type VoiceAnswer,
  type VoiceContent,
  type VoiceResponse,
} from './schema';

export const voicePlugin: QuestionTypePlugin<VoiceContent, VoiceAnswer, VoiceResponse> = {
  id: 'voice',
  name: 'Thu âm giọng nói',
  description: 'Bé đọc hoặc nói, phụ huynh nghe và chấm.',
  contentSchema: voiceContent,
  answerSchema: voiceAnswer,
  responseSchema: voiceResponse,
  emptyContent: { maxSeconds: 60 },
  emptyAnswer: { hint: '' },
  Editor,
  Player,
  Review,
  grade,
  validateAnswer() {
    return null;
  },
};
