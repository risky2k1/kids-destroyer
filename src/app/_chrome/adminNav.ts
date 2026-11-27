import { activeKey, buildAdminNav } from '@/core/modules';
import { PATHS } from '@/core/routes';
import { PACKAGES } from '@/packages/registry';
import { PLUGINS } from '@/plugins/registry';

const without = (modules: typeof PLUGINS, disabledIds: readonly string[]) =>
  modules.filter((module) => !disabledIds.includes(module.id));

export const MODULES = [...PLUGINS, ...PACKAGES];
export const ADMIN_NAV = buildAdminNav(PLUGINS, PACKAGES);

export function adminNav(disabledIds: readonly string[]) {
  return buildAdminNav(without(PLUGINS, disabledIds), without(PACKAGES, disabledIds));
}

/** 'home' for /admin; otherwise the matching nav key. Paths outside /admin never match. */
export function activeNav(pathname: string): string | null {
  if (pathname === PATHS.admin.root) return 'home';
  if (!pathname.startsWith(`${PATHS.admin.root}/`)) return null;
  return activeKey(pathname, ADMIN_NAV);
}
