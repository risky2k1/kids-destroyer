import { z } from 'zod';

export const roleInput = z.object({
  id: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]{1,30}$/,
      'Mã gồm chữ thường, số, gạch dưới; 2-31 ký tự, bắt đầu bằng chữ',
    ),
  name: z.string().trim().min(1, 'Nhập tên vai trò').max(50, 'Tên tối đa 50 ký tự'),
});

export const roleNameInput = roleInput.pick({ name: true });

export const permissionKeys = z
  .array(z.string().regex(/^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/))
  .max(200);

export const passwordInput = z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(72);

export const accountInput = z.object({
  email: z.string().trim().toLowerCase().email('Email không hợp lệ'),
  displayName: z.string().trim().min(1, 'Nhập tên').max(50, 'Tên tối đa 50 ký tự'),
  password: passwordInput,
  roleId: z.string().min(1, 'Chọn vai trò'),
});

export type RoleInput = z.infer<typeof roleInput>;
export type RoleNameInput = z.infer<typeof roleNameInput>;
export type AccountInput = z.infer<typeof accountInput>;
