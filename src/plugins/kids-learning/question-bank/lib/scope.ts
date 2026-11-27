/** PostgREST `or` filter: system questions plus this user's own. */
export function scopeFilter(uid: string): string {
  return `origin.eq.system,created_by.eq.${uid}`;
}
