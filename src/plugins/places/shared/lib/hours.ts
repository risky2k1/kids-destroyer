import type { OpeningSlot } from './types';

export type TimeSlotFilter = 'now' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'any';

export const TIME_SLOT_OPTIONS: { id: TimeSlotFilter; label: string; minute: number | null }[] = [
  { id: 'now', label: 'Đang mở', minute: null },
  { id: 'morning', label: 'Sáng (8h)', minute: 8 * 60 },
  { id: 'noon', label: 'Trưa (12h)', minute: 12 * 60 },
  { id: 'afternoon', label: 'Chiều (15h30)', minute: 15 * 60 + 30 },
  { id: 'evening', label: 'Tối (19h30)', minute: 19 * 60 + 30 },
  { id: 'night', label: 'Đêm (23h)', minute: 23 * 60 },
  { id: 'any', label: 'Mọi giờ', minute: null },
];

export const OPENING_PRESETS: { label: string; slots: OpeningSlot[] }[] = [
  { label: 'Cả ngày (06:00–22:00)', slots: [{ open: '06:00', close: '22:00' }] },
  {
    label: 'Sáng + Tối',
    slots: [
      { open: '06:30', close: '13:30' },
      { open: '17:00', close: '22:00' },
    ],
  },
  { label: 'Bán đêm (18:00–02:00)', slots: [{ open: '18:00', close: '02:00' }] },
  { label: '24/24', slots: [{ open: '00:00', close: '00:00' }] },
];

/** Parses 'HH:MM' (00:00..23:59 or 24:00) into minutes from midnight, or null if invalid. */
export function parseTimeMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h === 24 && min === 0) return 1440;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * True when the place is open at `minuteOfDay` (0..1439).
 * Places with no configured slots (`[]`) pass as "unknown hours" so existing places stay pickable.
 * Overnight slots (e.g. 18:00–02:00 where close < open) match >= 18:00 OR < 02:00.
 * Equal open and close (e.g. 00:00–00:00) means open 24/24.
 */
export function isOpenAt(slots: OpeningSlot[], minuteOfDay: number): boolean {
  if (slots.length === 0) return true;
  return slots.some((slot) => {
    const open = parseTimeMinutes(slot.open);
    const close = parseTimeMinutes(slot.close);
    if (open === null || close === null) return false;
    if (open === close || (open === 0 && close === 1440)) return true;
    if (close > open) return minuteOfDay >= open && minuteOfDay < close;
    return minuteOfDay >= open || minuteOfDay < close;
  });
}

export function resolveFilterMinute(timeSlot: TimeSlotFilter, nowMinute: number): number | null {
  if (timeSlot === 'any') return null;
  if (timeSlot === 'now') return nowMinute;
  return TIME_SLOT_OPTIONS.find((o) => o.id === timeSlot)?.minute ?? null;
}

const VN_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatClockInVietnam(now: Date = new Date()): string {
  const parts = VN_CLOCK.formatToParts(now);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour === '24' ? '00' : hour}:${minute}`;
}

export function nowMinutesInVietnam(now: Date = new Date()): number {
  return parseTimeMinutes(formatClockInVietnam(now)) ?? 0;
}

export function formatOpeningHours(slots: OpeningSlot[]): string {
  if (slots.length === 0) return '';
  if (
    slots.length === 1 &&
    ((slots[0].open === '00:00' && slots[0].close === '00:00') ||
      (slots[0].open === '00:00' && slots[0].close === '24:00'))
  ) {
    return 'Mở 24/24';
  }
  return slots.map((s) => `${s.open}–${s.close}`).join(', ');
}
