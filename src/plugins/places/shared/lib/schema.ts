import { z } from 'zod';
import type { PlaceStatus, PriceLevel, TagKind } from './types';

export type PlaceInput = {
  name: string;
  status: PlaceStatus;
  rating: number | null;
  priceLevel: PriceLevel | null;
  dishes: string | null;
  note: string | null;
  mapsUrl: string | null;
  visitedOn: string | null;
  categoryIds: string[];
  vibeIds: string[];
  areaId: string | null;
};

/** Blank (or whitespace-only) form values become null before validation. */
const blankToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(blankToNull, schema.nullable());
const optionalText = (max: number, message: string) =>
  optional(z.string().trim().max(max, message));

export const placeInput = z.object({
  name: z.string().trim().min(1, 'Nhập tên quán').max(100, 'Tên tối đa 100 ký tự'),
  status: z.enum(['visited', 'wishlist'], 'Trạng thái không hợp lệ'),
  rating: optional(z.coerce.number().int().min(1).max(5, 'Sao từ 1 đến 5')),
  priceLevel: optional(z.coerce.number().int().min(1).max(3, 'Mức giá không hợp lệ')).transform(
    (v) => v as PriceLevel | null,
  ),
  dishes: optionalText(1000, 'Món nên gọi tối đa 1000 ký tự'),
  note: optionalText(2000, 'Ghi chú tối đa 2000 ký tự'),
  mapsUrl: optional(
    z
      .string()
      .trim()
      .regex(/^https:\/\/\S+$/, 'Link phải bắt đầu bằng https://')
      .max(2000),
  ),
  visitedOn: optional(z.iso.date('Ngày không hợp lệ')),
  categoryIds: z.array(z.uuid()),
  vibeIds: z.array(z.uuid()),
  areaId: optional(z.uuid()),
}) satisfies z.ZodType<PlaceInput, unknown>;

/** Raw object for placeInput from a place form (multi-selects come in as repeated fields). */
export function placeFormValues(fd: FormData): unknown {
  const one = (key: string) => fd.get(key) ?? '';
  return {
    name: one('name'),
    status: one('status'),
    rating: one('rating'),
    priceLevel: one('priceLevel'),
    dishes: one('dishes'),
    note: one('note'),
    mapsUrl: one('mapsUrl'),
    visitedOn: one('visitedOn'),
    categoryIds: fd.getAll('categoryIds'),
    vibeIds: fd.getAll('vibeIds'),
    areaId: one('areaId'),
  };
}

export const tagInput = z.object({
  kind: z.enum(['category', 'vibe', 'area'], 'Loại tag không hợp lệ'),
  name: z.string().trim().min(1, 'Nhập tên').max(40, 'Tên tối đa 40 ký tự'),
  emoji: optional(z.string().trim().max(8, 'Emoji quá dài')),
}) satisfies z.ZodType<{ kind: TagKind; name: string; emoji: string | null }, unknown>;
