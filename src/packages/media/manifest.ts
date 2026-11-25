import { FolderOpen } from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const mediaManifest: ModuleManifest = {
  id: 'media',
  name: 'Thư viện tệp',
  description: 'Quản lí ảnh và tài liệu công khai, riêng tư dùng chung',
  version: '1.0.0',
  permissions: [
    { key: 'media.view', label: 'Xem thư viện tệp' },
    { key: 'media.manage', label: 'Quản lí, tải lên và xoá tệp' },
  ],
  nav: [
    {
      group: 'content',
      key: 'media',
      href: PATHS.admin.media,
      label: 'Thư viện tệp',
      icon: FolderOpen,
      iconClass: 'text-chart-5',
      permission: 'media.view',
    },
  ],
};
