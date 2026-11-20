import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, fromRows, settingsInput } from './schemas';

describe('settings', () => {
  it('falls back to defaults for missing or malformed rows', () => {
    expect(fromRows([])).toEqual(DEFAULT_SETTINGS);
    expect(
      fromRows([
        { key: 'allow_retry', value: 'no' },
        { key: 'site_name', value: '  ' },
        { key: 'logo_url', value: 'javascript:alert(1)' },
        { key: 'favicon_url', value: 12345 },
      ]),
    ).toEqual(DEFAULT_SETTINGS);
  });

  it('reads stored values', () => {
    expect(
      fromRows([
        { key: 'site_name', value: 'Nhà mình' },
        { key: 'allow_retry', value: false },
        { key: 'logo_url', value: 'https://example.com/logo.png' },
        { key: 'favicon_url', value: 'http://example.com/favicon.ico' },
      ]),
    ).toEqual({
      siteName: 'Nhà mình',
      allowRetry: false,
      logoUrl: 'https://example.com/logo.png',
      faviconUrl: 'http://example.com/favicon.ico',
    });
  });

  it('rejects an empty site name', () => {
    expect(settingsInput.safeParse({ siteName: ' ', allowRetry: true }).success).toBe(false);
  });
});
