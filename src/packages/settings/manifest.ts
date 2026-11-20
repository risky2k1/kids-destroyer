import { Settings as SettingsIcon } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const settingsManifest: ModuleManifest = {
  id: 'settings',
  name: 'Cài đặt',
  description: 'Tên site, logo, favicon và tuỳ chọn chung',
  version: '1.0.0',
  permissions: [{ key: 'settings.manage', label: 'Cài đặt' }],
  nav: [
    {
      group: 'system',
      key: 'settings',
      href: PATHS.admin.settings,
      label: 'Cài đặt',
      icon: SettingsIcon,
      iconClass: 'text-chart-4',
      permission: 'settings.manage',
    },
  ],
};
