import type { ModuleManifest } from '@/core/modules';
import { accessManifest } from './access/manifest';
import { settingsManifest } from './settings/manifest';

export const PACKAGES: ModuleManifest[] = [accessManifest, settingsManifest];
