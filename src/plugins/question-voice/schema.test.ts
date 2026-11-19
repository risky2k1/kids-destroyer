import { describe, expect, it } from 'vitest';
import { VOICE_PATH_REGEX, voiceAnswer, voiceContent, voiceResponse } from './schema';

describe('question-voice schema', () => {
  describe('path regex & voiceResponse', () => {
    const validFam = '11111111-1111-1111-1111-111111111111';
    const validKid = '22222222-2222-2222-2222-222222222222';
    const validFile = '33333333-3333-3333-3333-333333333333';

    it('accepts valid webm, mp4, ogg paths', () => {
      const pWebm = `${validFam}/${validKid}/${validFile}.webm`;
      const pMp4 = `${validFam}/${validKid}/${validFile}.mp4`;
      const pOgg = `${validFam}/${validKid}/${validFile}.ogg`;

      expect(VOICE_PATH_REGEX.test(pWebm)).toBe(true);
      expect(VOICE_PATH_REGEX.test(pMp4)).toBe(true);
      expect(VOICE_PATH_REGEX.test(pOgg)).toBe(true);

      expect(voiceResponse.safeParse({ path: pWebm }).success).toBe(true);
      expect(voiceResponse.safeParse({ path: pMp4 }).success).toBe(true);
      expect(voiceResponse.safeParse({ path: pOgg }).success).toBe(true);
    });

    it('rejects path traversal attacks like ../x', () => {
      expect(VOICE_PATH_REGEX.test('../x')).toBe(false);
      expect(voiceResponse.safeParse({ path: '../x' }).success).toBe(false);

      expect(VOICE_PATH_REGEX.test('../../etc/passwd')).toBe(false);
      expect(voiceResponse.safeParse({ path: '../../etc/passwd' }).success).toBe(false);

      const traversalSubdir = `${validFam}/../${validFile}.webm`;
      expect(VOICE_PATH_REGEX.test(traversalSubdir)).toBe(false);
      expect(voiceResponse.safeParse({ path: traversalSubdir }).success).toBe(false);
    });

    it('rejects unsupported extensions', () => {
      const pWav = `${validFam}/${validKid}/${validFile}.wav`;
      const pMp3 = `${validFam}/${validKid}/${validFile}.mp3`;
      const pTxt = `${validFam}/${validKid}/${validFile}.txt`;
      const pM4a = `${validFam}/${validKid}/${validFile}.m4a`;

      expect(VOICE_PATH_REGEX.test(pWav)).toBe(false);
      expect(VOICE_PATH_REGEX.test(pMp3)).toBe(false);
      expect(VOICE_PATH_REGEX.test(pTxt)).toBe(false);
      expect(VOICE_PATH_REGEX.test(pM4a)).toBe(false);

      expect(voiceResponse.safeParse({ path: pWav }).success).toBe(false);
      expect(voiceResponse.safeParse({ path: pMp3 }).success).toBe(false);
    });

    it('rejects malformed UUIDs', () => {
      expect(VOICE_PATH_REGEX.test(`short/${validKid}/${validFile}.webm`)).toBe(false);
      expect(VOICE_PATH_REGEX.test(`${validFam}/not-uuid/${validFile}.webm`)).toBe(false);
      expect(VOICE_PATH_REGEX.test(`${validFam}/${validKid}/not-uuid.webm`)).toBe(false);
    });
  });

  describe('voiceContent validation', () => {
    it('accepts valid maxSeconds between 10 and 120', () => {
      expect(voiceContent.safeParse({ maxSeconds: 10 }).success).toBe(true);
      expect(voiceContent.safeParse({ maxSeconds: 60 }).success).toBe(true);
      expect(voiceContent.safeParse({ maxSeconds: 120 }).success).toBe(true);
    });

    it('defaults maxSeconds to 60', () => {
      const parsed = voiceContent.parse({});
      expect(parsed.maxSeconds).toBe(60);
    });

    it('rejects maxSeconds < 10 or > 120 or non-integer', () => {
      expect(voiceContent.safeParse({ maxSeconds: 9 }).success).toBe(false);
      expect(voiceContent.safeParse({ maxSeconds: 121 }).success).toBe(false);
      expect(voiceContent.safeParse({ maxSeconds: 15.5 }).success).toBe(false);
    });
  });

  describe('voiceAnswer validation', () => {
    it('accepts empty hint or valid hint <= 500 characters', () => {
      expect(voiceAnswer.safeParse({ hint: '' }).success).toBe(true);
      expect(voiceAnswer.safeParse({ hint: 'a'.repeat(500) }).success).toBe(true);
    });

    it('defaults hint to empty string', () => {
      const parsed = voiceAnswer.parse({});
      expect(parsed.hint).toBe('');
    });

    it('rejects hint longer than 500 characters', () => {
      expect(voiceAnswer.safeParse({ hint: 'a'.repeat(501) }).success).toBe(false);
    });
  });
});
