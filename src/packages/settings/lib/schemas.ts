import { z } from 'zod';

export type AppSettings = {
  siteName: string;
  allowRetry: boolean;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'Kids CMS',
  allowRetry: true,
  logoUrl: null,
  faviconUrl: null,
};

export const settingsInput = z.object({
  siteName: z.string().trim().min(1, 'Nhập tên hiển thị').max(40, 'Tên tối đa 40 ký tự'),
  allowRetry: z.boolean(),
});

/** Rows of `settings` (key → jsonb) to typed settings; unknown or malformed values fall back to defaults. */
export function fromRows(rows: { key: string; value: unknown }[]): AppSettings {
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const siteName = map.get('site_name');
  const allowRetry = map.get('allow_retry');
  const logo = map.get('logo_url');
  const favicon = map.get('favicon_url');

  const validUrl = (v: unknown): string | null =>
    typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://')) ? v : null;

  return {
    siteName:
      typeof siteName === 'string' && siteName.trim() ? siteName : DEFAULT_SETTINGS.siteName,
    allowRetry: typeof allowRetry === 'boolean' ? allowRetry : DEFAULT_SETTINGS.allowRetry,
    logoUrl: validUrl(logo),
    faviconUrl: validUrl(favicon),
  };
}
