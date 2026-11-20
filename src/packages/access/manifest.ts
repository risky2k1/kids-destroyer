import type { ModuleManifest } from '@/core/modules';

export const accessManifest: ModuleManifest = {
  id: 'access',
  name: 'Phân quyền',
  permissions: [
    { key: 'admin.access', label: 'Vào khu quản trị' },
    { key: 'access.manage', label: 'Quản lý vai trò và gán vai trò' },
  ],
  nav: [],
};
