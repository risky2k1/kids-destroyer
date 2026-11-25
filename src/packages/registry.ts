import type { ModuleManifest } from '@/core/modules';
import { accessManifest } from './access/manifest';
import { mediaManifest } from './media/manifest';
import { modulesManifest } from './modules/manifest';
import { settingsManifest } from './settings/manifest';

export const PACKAGES: ModuleManifest[] = [
  mediaManifest,
  accessManifest,
  modulesManifest,
  settingsManifest,
];
