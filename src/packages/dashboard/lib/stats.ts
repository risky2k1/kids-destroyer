export function kidsByGrade(
  grades: { id: string; name: string; sort: number }[],
  kids: { grade_id: string }[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const kid of kids) {
    counts.set(kid.grade_id, (counts.get(kid.grade_id) ?? 0) + 1);
  }
  return [...grades]
    .sort((a, b) => a.sort - b.sort)
    .map((grade) => ({ name: grade.name, count: counts.get(grade.id) ?? 0 }));
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Relative time in Vietnamese, measured from `now`. */
export function timeAgo(iso: string, now: Date): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (elapsed < MINUTE) return 'vừa xong';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} phút trước`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} giờ trước`;
  const days = Math.floor(elapsed / DAY);
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}
