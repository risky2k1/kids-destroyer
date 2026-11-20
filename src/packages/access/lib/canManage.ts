import { can, SUPER_ADMIN, type Principal } from '@/core/acl/access';

/** May `actor` reset the password of / delete an account holding `target` role? Never more power than you have. */
export function canManage(
  actor: Principal,
  target: { roleId: string; permissions: readonly string[] },
): boolean {
  if (actor.roleId === SUPER_ADMIN) return true;
  if (target.roleId === SUPER_ADMIN) return false;
  return target.permissions.every((p) => can(actor, p));
}
