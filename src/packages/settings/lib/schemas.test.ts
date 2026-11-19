import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, fromRows, settingsInput } from './schemas';

describe('settings', () => {
  it('falls back to defaults for missing or malformed rows', () => {
    expect(fromRows([])).toEqual(DEFAULT_SETTINGS);
    expect(
      fromRows([
        { key: 'allow_retry', value: 'no' },
        { key: 'site_name', value: '  ' },
      ]),
    ).toEqual(DEFAULT_SETTINGS);
  });

  it('reads stored values', () => {
    expect(
      fromRows([
        { key: 'site_name', value: 'Nhà mình' },
        { key: 'allow_retry', value: false },
      ]),
    ).toEqual({ siteName: 'Nhà mình', allowRetry: false });
  });

  it('rejects an empty site name', () => {
    expect(settingsInput.safeParse({ siteName: ' ', allowRetry: true }).success).toBe(false);
  });
});
