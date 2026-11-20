import { z } from 'zod';

export const VOICE_PATH_REGEX = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(webm|mp4|ogg)$/;

export const voiceContent = z.object({
  maxSeconds: z
    .number()
    .int('Thời gian thu âm phải là số nguyên')
    .min(10, 'Tối thiểu 10 giây')
    .max(120, 'Tối đa 120 giây')
    .default(60),
});

export const voiceAnswer = z.object({
  hint: z.string().max(500, 'Gợi ý không quá 500 ký tự').default(''),
});

export const voiceResponse = z.object({
  path: z.string().regex(VOICE_PATH_REGEX, 'Đường dẫn bản ghi âm không hợp lệ'),
});

export type VoiceContent = z.infer<typeof voiceContent>;
export type VoiceAnswer = z.infer<typeof voiceAnswer>;
export type VoiceResponse = z.infer<typeof voiceResponse>;
