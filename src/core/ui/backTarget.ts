import type { Role } from '@/core/acl/access';
import { PATHS } from '@/core/routes';

/** Where "Quay lại" goes, or null on a screen that is already a root. */
export function backTarget(path: string, role?: Role): { href: string; label: string } | null {
  if (path === PATHS.parent.kidMode || path.startsWith('/parent/assignments/')) {
    return { href: PATHS.parent.root, label: 'Phụ huynh' };
  }
  if (path === PATHS.parent.root && role === 'admin') {
    return { href: PATHS.admin.root, label: 'Quản trị' };
  }
  if (path === PATHS.kid.exit) {
    return { href: PATHS.kid.root, label: 'Làm bài' };
  }
  return null;
}
