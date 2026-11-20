import { activeKey, buildNav } from '@/core/modules';
import { PATHS } from '@/core/routes';
import { PACKAGES } from '@/packages/registry';
import { PLUGINS } from '@/plugins/registry';

export const ADMIN_NAV = buildNav([...PLUGINS, ...PACKAGES]);

/** 'home' for /admin; otherwise the matching nav key. Paths outside /admin never match. */
export function activeNav(pathname: string): string | null {
  if (pathname === PATHS.admin.root) return 'home';
  if (!pathname.startsWith(`${PATHS.admin.root}/`)) return null;
  return activeKey(pathname, ADMIN_NAV);
}
