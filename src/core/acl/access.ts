export type Role = 'admin' | 'parent';
export type Area = 'admin' | 'parent' | 'kid';

export function canEnter(area: Area, user: { role: Role; familyId: string | null }): boolean {
  if (area === 'admin') return user.role === 'admin';
  if (area === 'parent') return true;
  return user.role === 'parent' && user.familyId !== null;
}
