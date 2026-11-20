import type { ModuleManifest } from '@/core/modules';
import { kidsLearningManifest } from './kids-learning/manifest';

/** Feature plugins, in sidebar order. */
export const PLUGINS: ModuleManifest[] = [kidsLearningManifest];
