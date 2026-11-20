import { Blocks } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const modulesManifest: ModuleManifest = {
  id: 'modules',
  name: 'Plugin',
  description: 'Bật/tắt plugin tính năng',
  version: '1.0.0',
  permissions: [{ key: 'modules.manage', label: 'Bật/tắt plugin' }],
  nav: [
    {
      group: 'system',
      key: 'modules',
      label: 'Plugin',
      href: PATHS.admin.modules,
      icon: Blocks,
      iconClass: 'text-chart-5',
      permission: 'modules.manage',
    },
  ],
};
