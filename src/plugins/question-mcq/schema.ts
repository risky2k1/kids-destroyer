import { z } from 'zod';

export const mcqContent = z.object({
  options: z
    .array(z.string().trim().min(1, 'Nhập nội dung phương án').max(200, 'Phương án quá dài'))
    .min(2, 'Cần từ 2 phương án')
    .max(6, 'Tối đa 6 phương án'),
  multiple: z.boolean(),
});

/** Content-independent base. Use `mcqAnswerFor` once options and multiple are known. */
export const mcqAnswer = z.object({
  correct: z.array(z.number().int()),
});

export const mcqResponse = z.object({
  selected: z.array(z.number().int()),
});

export type McqContent = z.infer<typeof mcqContent>;
export type McqAnswer = z.infer<typeof mcqAnswer>;
export type McqResponse = z.infer<typeof mcqResponse>;

/** Indices in range, unique, exactly one when single-choice, at least one otherwise. */
export function mcqAnswerFor(content: { options: string[]; multiple: boolean }) {
  const count = content.options.length;
  return mcqAnswer.refine((answer) => {
    const { correct } = answer;
    if (new Set(correct).size !== correct.length) return false;
    if (correct.some((index) => index < 0 || index >= count)) return false;
    return content.multiple ? correct.length >= 1 : correct.length === 1;
  }, 'Chọn đáp án đúng hợp lệ');
}
