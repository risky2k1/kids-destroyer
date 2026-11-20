import type { ModuleManifest } from '@/core/modules';
import { kidsLearningManifest } from './kids-learning/manifest';
import { swordXStaffManifest } from './sword-x-staff/manifest';

/** Feature plugins, in sidebar order. */
export const PLUGINS: ModuleManifest[] = [kidsLearningManifest, swordXStaffManifest];
