import { KeyRound, ShieldCheck, UserCog } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const accessManifest: ModuleManifest = {
  id: 'access',
  name: 'Phân quyền',
  permissions: [
    { key: 'admin.access', label: 'Vào khu quản trị' },
    { key: 'access.manage', label: 'Quản lý vai trò và gán vai trò' },
  ],
  nav: [
    {
      group: 'system',
      key: 'access',
      label: 'Phân quyền',
      icon: ShieldCheck,
      iconClass: 'text-chart-2',
      children: [
        {
          key: 'roles',
          href: PATHS.admin.roles,
          label: 'Vai trò',
          icon: KeyRound,
          iconClass: 'text-chart-2',
          permission: 'access.manage',
        },
        {
          key: 'users',
          href: PATHS.admin.users,
          label: 'Tài khoản',
          icon: UserCog,
          iconClass: 'text-chart-2',
          permission: 'access.manage',
        },
      ],
    },
  ],
};
