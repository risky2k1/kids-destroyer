import { Swords } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { SXS_PATHS } from './studio/lib/paths';

export const swordXStaffManifest: ModuleManifest = {
  id: 'sword-x-staff',
  name: 'Sword x Staff',
  permissions: [{ key: 'sxs.use', label: 'Dùng Sword x Staff studio' }],
  nav: [
    {
      group: 'apps',
      key: 'sxs',
      label: 'Sword x Staff',
      href: SXS_PATHS.characters,
      icon: Swords,
      iconClass: 'text-chart-1',
      permission: 'sxs.use',
    },
  ],
};
