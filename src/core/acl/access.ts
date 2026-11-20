export type Area = 'admin' | 'parent' | 'kid';
export const SUPER_ADMIN = 'super_admin';
export const ADMIN_ACCESS = 'admin.access';

/** What a guard needs to know about a user. */
export type Principal = { roleId: string; permissions: readonly string[]; familyId: string | null };

export function can(user: Principal, permission: string): boolean {
  return user.roleId === SUPER_ADMIN || user.permissions.includes(permission);
}

export function canEnter(area: Area, user: Principal): boolean {
  if (area === 'admin') return can(user, ADMIN_ACCESS);
  if (area === 'parent') return true;
  return user.familyId !== null;
}
