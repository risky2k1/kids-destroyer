import { z } from 'zod';

const blankToNull = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
};

const dueAt = z
  .string()
  .trim()
  .nullish()
  .superRefine((value, ctx) => {
    if (value && Number.isNaN(Date.parse(value))) {
      ctx.addIssue({ code: 'custom', message: 'Hạn nộp không hợp lệ' });
    }
  })
  .transform((value) => (value ? new Date(value) : null));

const optionalText = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .nullish()
    .transform((value) => blankToNull(value));

export const assignInput = z.object({
  quizId: z.uuid(),
  kidIds: z.array(z.uuid()).min(1, 'Chọn ít nhất 1 bé'),
  dueAt,
});

export const submitInput = z.object({
  assignmentId: z.uuid(),
  round: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2)], { error: 'Vòng làm không hợp lệ' })),
  responses: z.record(z.uuid(), z.unknown()),
});

export const reviewInput = z.object({
  assignmentId: z.uuid(),
  comment: optionalText(1000, 'Nhận xét tối đa 1000 ký tự'),
  items: z.array(
    z.object({
      responseId: z.uuid(),
      manual: z.number().min(0).max(1).nullable(),
      feedback: optionalText(500, 'Nhận xét câu tối đa 500 ký tự'),
    }),
  ),
});

export type AssignInput = z.infer<typeof assignInput>;
export type SubmitInput = z.infer<typeof submitInput>;
export type ReviewInput = z.infer<typeof reviewInput>;
