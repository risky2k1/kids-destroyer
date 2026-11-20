import type { PermissionDef } from '@/core/modules';

export type PermissionGroup = {
  module: string;
  permissions: PermissionDef[];
};
