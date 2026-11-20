import { z } from 'zod';

export const matchContent = z
  .object({
    left: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Nhập nội dung vế trái')
          .max(100, 'Nội dung vế trái tối đa 100 ký tự'),
      )
      .min(2, 'Cần từ 2 cặp')
      .max(6, 'Tối đa 6 cặp'),
    right: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Nhập nội dung vế phải')
          .max(100, 'Nội dung vế phải tối đa 100 ký tự'),
      )
      .min(2, 'Cần từ 2 cặp')
      .max(6, 'Tối đa 6 cặp'),
  })
  .refine((data) => data.left.length === data.right.length, {
    message: 'Số lượng hai vế phải bằng nhau',
  });

/** Content-independent base answer schema. */
export const matchAnswer = z.object({
  pairs: z.array(z.number().int()),
});

/**
 * Response schema for kid submission.
 * Rejects malformed input: invalid length, out-of-range indices, non-integers.
 */
export const matchResponse = z.object({
  pairs: z
    .array(
      z
        .number()
        .int('Chỉ số phải là số nguyên')
        .min(0, 'Chỉ số không được âm')
        .max(5, 'Chỉ số vượt quá giới hạn')
        .nullable(),
    )
    .min(2, 'Cần ít nhất 2 cặp')
    .max(6, 'Tối đa 6 cặp'),
});

export type MatchContent = z.infer<typeof matchContent>;
export type MatchAnswer = z.infer<typeof matchAnswer>;
export type MatchResponse = z.infer<typeof matchResponse>;

/** Validates that answer.pairs has matching length to left and all indices point to valid right items. */
export function matchAnswerFor(content: { left: string[]; right: string[] }) {
  const leftCount = content.left.length;
  const rightCount = content.right.length;

  return matchAnswer.refine((answer) => {
    const { pairs } = answer;
    if (pairs.length !== leftCount) return false;
    return pairs.every((rightIdx) => rightIdx >= 0 && rightIdx < rightCount);
  }, 'Mỗi vế trái phải được ghép với một vế phải hợp lệ');
}
