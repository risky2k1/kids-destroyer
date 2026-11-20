import { z } from 'zod';
import { AVATARS } from './avatars';

const name = (max: number) => z.string().trim().min(1, 'Không được để trống').max(max);

export const pinSchema = z.string().regex(/^\d{4}$/, 'PIN gồm đúng 4 chữ số');

export const familyInput = z.object({ name: name(50) });

export const parentInput = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  displayName: name(50),
  familyId: z.uuid(),
});

export const kidInput = z.object({
  displayName: name(30),
  avatar: z.enum(AVATARS, 'Chọn một avatar'),
  gradeId: z.uuid('Chọn lớp'),
  familyId: z.uuid(),
  pin: z.preprocess((v) => (v === '' || v == null ? undefined : v), pinSchema.optional()),
});
