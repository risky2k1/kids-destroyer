import { z } from 'zod';

export const orderContent = z.object({
  items: z
    .array(z.string().trim().min(1, 'Nhập nội dung mục').max(100, 'Nội dung mục tối đa 100 ký tự'))
    .min(2, 'Cần từ 2 mục')
    .max(8, 'Tối đa 8 mục'),
});

/** Content-independent base answer schema. */
export const orderAnswer = z.object({
  order: z.array(z.number().int()),
});

/**
 * Response schema for kid submission.
 * Rejects malformed input: invalid length, out-of-range indices, duplicates, or non-integers.
 */
export const orderResponse = z.object({
  order: z
    .array(
      z
        .number()
        .int('Chỉ số phải là số nguyên')
        .min(0, 'Chỉ số không được âm')
        .max(7, 'Chỉ số vượt quá giới hạn'),
    )
    .min(2, 'Cần ít nhất 2 mục')
    .max(8, 'Tối đa 8 mục')
    .refine((arr) => new Set(arr).size === arr.length, 'Thứ tự không được chứa phần tử trùng lặp'),
});

export type OrderContent = z.infer<typeof orderContent>;
export type OrderAnswer = z.infer<typeof orderAnswer>;
export type OrderResponse = z.infer<typeof orderResponse>;

/** Validates that answer.order is a valid permutation of indices 0..n-1 for given content. */
export function orderAnswerFor(content: { items: string[] }) {
  const count = content.items.length;
  return orderAnswer.refine((answer) => {
    const { order } = answer;
    if (order.length !== count) return false;
    if (new Set(order).size !== count) return false;
    return order.every((index) => index >= 0 && index < count);
  }, 'Đáp án phải là hoán vị hợp lệ các mục');
}
