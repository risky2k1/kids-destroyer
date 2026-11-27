import { z } from 'zod';

export const draftRequest = z.object({
  subjectId: z.uuid(),
  gradeId: z.uuid(),
  topicId: z.uuid().nullable(),
  count: z.number().int().min(1).max(20).default(10),
  types: z.array(z.enum(['mcq', 'fill', 'number', 'order', 'match'])).min(1),
  lang: z.enum(['vi', 'en']),
  note: z.string().max(500).default(''),
});

export type DraftRequest = z.infer<typeof draftRequest>;
