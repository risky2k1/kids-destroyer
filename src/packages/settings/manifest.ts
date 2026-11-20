import { Settings as SettingsIcon } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const settingsManifest: ModuleManifest = {
  id: 'settings',
  name: 'Cài đặt',
  nav: [
    {
      group: 'system',
      key: 'settings',
      href: PATHS.admin.settings,
      label: 'Cài đặt',
      icon: SettingsIcon,
      iconClass: 'text-chart-4',
    },
  ],
};
