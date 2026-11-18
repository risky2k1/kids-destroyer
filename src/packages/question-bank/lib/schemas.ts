import { z } from 'zod';

export const questionMeta = z.object({
  type: z.string().trim().min(1, 'Chọn dạng câu'),
  subjectId: z.uuid(),
  gradeId: z.uuid(),
  topicId: z.uuid().nullable().optional(),
  lang: z.enum(['vi', 'en']),
  prompt: z.string().trim().min(1, 'Nhập đề bài').max(500, 'Đề bài tối đa 500 ký tự'),
});

export type QuestionMeta = z.infer<typeof questionMeta>;
