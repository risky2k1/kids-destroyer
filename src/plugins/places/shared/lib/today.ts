const VN_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

const VN_DATETIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function vnParts(d: Date) {
  const parts = VN_DATETIME.formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
  };
}

/** Calendar day in Vietnam as 'YYYY-MM-DD' (servers run in UTC). */
export const todayInVietnam = (now: Date = new Date()): string => VN_DATE.format(now);

/** Value for `<input type="datetime-local">` in Vietnam time: 'YYYY-MM-DDTHH:mm'. */
export function toVietnamDatetimeLocal(d: Date | string = new Date()): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  const p = vnParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Converts 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm', or ISO timestamp to a UTC ISO string assuming +07:00 for naive values. */
export function vietnamInputToIso(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00+07:00`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}:00+07:00`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Formats an ISO timestamp for Vietnamese UI: 'DD/MM/YYYY HH:mm'. */
export function formatVisitDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = vnParts(d);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}
