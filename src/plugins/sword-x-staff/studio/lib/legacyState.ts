import legacyDefault from './legacy-default.json';
import type { LegacyState } from './legacy.types';

const QUALITY: Record<string, string> = {
  'Lam (Hiếm)': 'Rare',
  'Tím (Sử Thi)': 'Epic',
  'Cam (Truyền Thuyết)': 'Legendary',
  'Vàng (Kỳ Tích)': 'Mythic',
  'Đỏ (Thần Thoại)': 'Divine',
};

export function qualityName(value: string) {
  return QUALITY[value] ?? value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base: unknown, extra: unknown): unknown {
  if (Array.isArray(base) && Array.isArray(extra)) return extra;
  if (!isRecord(base) || !isRecord(extra)) return extra === undefined ? base : extra;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    out[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function mergeLegacy(parsed: unknown): LegacyState {
  if (!isRecord(parsed)) throw new Error('JSON không hợp lệ');
  return deepMerge(legacyDefault, parsed) as LegacyState;
}
