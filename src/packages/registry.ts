import type { ModuleManifest } from '@/core/modules';
import { accessManifest } from './access/manifest';
import { modulesManifest } from './modules/manifest';
import { settingsManifest } from './settings/manifest';

export const PACKAGES: ModuleManifest[] = [accessManifest, modulesManifest, settingsManifest];
