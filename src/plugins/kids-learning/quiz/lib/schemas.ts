import { z } from 'zod';

export const quizInput = z
  .object({
    title: z.string().trim().min(1, 'Nhập tên đề').max(100, 'Tên đề tối đa 100 ký tự'),
    subjectId: z.uuid(),
    gradeId: z.uuid(),
    items: z
      .array(
        z.object({
          questionId: z.uuid(),
          points: z.number().positive(),
        }),
      )
      .min(1, 'Đề cần ít nhất 1 câu'),
  })
  .refine(
    (quiz) => new Set(quiz.items.map((item) => item.questionId)).size === quiz.items.length,
    'Câu bị trùng',
  );

export type QuizInput = z.infer<typeof quizInput>;
