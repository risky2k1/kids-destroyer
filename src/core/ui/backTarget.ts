import { PATHS } from '@/core/routes';

/** Where "Quay lại" goes, or null on a screen that is already a root. */
export function backTarget(
  path: string,
  canAdmin?: boolean,
): { href: string; label: string } | null {
  if (path === PATHS.parent.kidMode || path.startsWith('/parent/assignments/')) {
    return { href: PATHS.parent.root, label: 'Phụ huynh' };
  }
  if (path === PATHS.parent.root && canAdmin) {
    return { href: PATHS.admin.root, label: 'Quản trị' };
  }
  if (path === PATHS.kid.exit) {
    return { href: PATHS.kid.root, label: 'Làm bài' };
  }
  return null;
}
