import { z } from 'zod';

import { asPlain } from '@/core/text/plain';
import { parseTimeMinutes } from './hours';
import { PLACE_ICON_KEYS } from './icons';
import { vietnamInputToIso } from './today';
import type { OpeningSlot, PlaceStatus, PriceLevel, TagKind } from './types';

export type PlaceInput = {
  name: string;
  status: PlaceStatus;
  rating: number | null;
  priceLevel: PriceLevel | null;
  dishes: string | null;
  note: string | null;
  mapsUrl: string | null;
  visitedOn: string | null;
  visitNote: string | null;
  openHours: OpeningSlot[];
  categoryIds: string[];
  vibeIds: string[];
  areaId: string | null;
};

/** Blank (or whitespace-only) form values become null before validation. */
const blankToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(blankToNull, schema.nullable());
const optionalText = (max: number, message: string) =>
  optional(z.preprocess(asPlain, z.string().trim().max(max, message)));

export const openingSlotSchema = z.object({
  open: z.string().refine((v) => parseTimeMinutes(v) !== null, 'Giờ mở không hợp lệ'),
  close: z.string().refine((v) => parseTimeMinutes(v) !== null, 'Giờ đóng không hợp lệ'),
});

export const openHoursSchema = z.preprocess(
  (raw) => {
    if (raw === undefined || raw === null || raw === '') return [];
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return 'invalid-json';
      }
    }
    return raw;
  },
  z.array(openingSlotSchema, 'Giờ mở cửa không hợp lệ').max(5, 'Tối đa 5 khung giờ'),
);

export const placeInput = z.object({
  name: z.preprocess(
    asPlain,
    z.string().trim().min(1, 'Nhập tên quán').max(100, 'Tên tối đa 100 ký tự'),
  ),
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
  visitedOn: optional(
    z
      .string()
      .trim()
      .refine(
        (v) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(v) && vietnamInputToIso(v) !== null,
        {
          message: 'Ngày không hợp lệ',
        },
      ),
  ),
  visitNote: optionalText(1000, 'Lý do lần đi tối đa 1000 ký tự'),
  openHours: openHoursSchema,
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
    visitNote: one('visitNote'),
    openHours: one('openHours'),
    categoryIds: fd.getAll('categoryIds'),
    vibeIds: fd.getAll('vibeIds'),
    areaId: one('areaId'),
  };
}

export const visitInput = z.object({
  placeId: z.uuid('Không tìm thấy quán'),
  visitedAt: z
    .string()
    .trim()
    .min(1, 'Chọn thời gian')
    .transform((v, ctx) => {
      const iso = vietnamInputToIso(v);
      if (!iso) {
        ctx.addIssue({ code: 'custom', message: 'Thời gian không hợp lệ' });
        return z.NEVER;
      }
      return iso;
    }),
  rating: optional(z.coerce.number().int().min(1).max(5, 'Sao từ 1 đến 5')),
  note: optionalText(1000, 'Lý do tối đa 1000 ký tự'),
});

export const tagInput = z.object({
  kind: z.enum(['category', 'vibe', 'area'], 'Loại tag không hợp lệ'),
  name: z.preprocess(asPlain, z.string().trim().min(1, 'Nhập tên').max(40, 'Tên tối đa 40 ký tự')),
  emoji: optional(z.string().trim().max(8, 'Emoji quá dài')),
  icon: optional(
    z
      .string()
      .trim()
      .max(40, 'Icon không hợp lệ')
      .refine((v) => PLACE_ICON_KEYS.includes(v), 'Icon không hợp lệ'),
  ),
}) satisfies z.ZodType<
  { kind: TagKind; name: string; emoji: string | null; icon: string | null },
  unknown
>;
