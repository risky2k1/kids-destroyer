import { z } from 'zod';

export const essayContent = z.object({
  minWords: z
    .number()
    .int('Số từ phải là số nguyên')
    .min(0, 'Số từ tối thiểu không được âm')
    .max(200, 'Tối đa 200 từ')
    .default(0),
});

export const essayAnswer = z.object({
  sample: z.string().max(2000, 'Bài mẫu không quá 2000 ký tự').default(''),
});

/**
 * Response schema for kid submission.
 * Rejects malformed input: non-string, empty after trim, or exceeding 2000 characters.
 */
export const essayResponse = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập bài làm')
    .max(2000, 'Bài làm không được quá 2000 ký tự'),
});

export type EssayContent = z.infer<typeof essayContent>;
export type EssayAnswer = z.infer<typeof essayAnswer>;
export type EssayResponse = z.infer<typeof essayResponse>;
