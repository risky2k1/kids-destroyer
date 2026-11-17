import { PATHS } from '@/core/routes';

const ADULT_AREAS = [PATHS.parent.root, PATHS.admin.root];

/** While a kid cookie is present, adult areas bounce to the kid area. Optimistic only. */
export function kidModeRedirect(pathname: string, hasKidCookie: boolean): string | null {
  if (!hasKidCookie) return null;
  const adult = ADULT_AREAS.some((root) => pathname === root || pathname.startsWith(root + '/'));
  return adult ? PATHS.kid.root : null;
}
