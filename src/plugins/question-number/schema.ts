import { z } from 'zod';

export const numberContent = z.object({
  unit: z.string().trim().max(40).optional(),
});

export const numberAnswer = z.object({
  value: z.number(),
  tolerance: z.number().min(0, 'Sai số không được âm').default(0),
});

export const numberResponse = z.object({
  value: z.number(),
});

export type NumberContent = z.infer<typeof numberContent>;
export type NumberAnswer = z.infer<typeof numberAnswer>;
export type NumberResponse = z.infer<typeof numberResponse>;
