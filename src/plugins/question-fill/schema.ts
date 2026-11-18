import { z } from 'zod';

export const fillContent = z.object({
  text: z.string(),
});

export const fillAnswer = z.object({
  blanks: z.array(z.array(z.string().min(1)).min(1)).min(1, 'Cần ít nhất một chỗ trống [[...]]'),
});

export const fillResponse = z.object({
  values: z.array(z.string()),
});

export type FillContent = z.infer<typeof fillContent>;
export type FillAnswer = z.infer<typeof fillAnswer>;
export type FillResponse = z.infer<typeof fillResponse>;
