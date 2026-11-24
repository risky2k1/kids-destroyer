import { MapPin } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PLACES_PATHS } from './shared/lib/paths';

export const placesManifest: ModuleManifest = {
  id: 'places',
  name: 'Đi đâu',
  description: 'Sổ quán quen và nút random chọn quán',
  version: '1.0.0',
  permissions: [{ key: 'places.manage', label: 'Quản lý quán ăn (Đi đâu)' }],
  nav: [
    {
      group: 'apps',
      key: 'places',
      label: 'Đi đâu',
      href: PLACES_PATHS.admin,
      icon: MapPin,
      iconClass: 'text-chart-3',
      permission: 'places.manage',
    },
  ],
};
