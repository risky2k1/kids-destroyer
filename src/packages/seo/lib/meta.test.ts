import { describe, expect, it } from 'vitest';
import { rootMeta, shareCopy, shareImagePath, shareMeta, shareTitle } from './meta';

describe('share meta', () => {
  it('uses the public name when settings are still the template default', () => {
    expect(shareTitle('T-CMS')).toBe('phmtuns');
    expect(shareTitle('  ')).toBe('phmtuns');
    expect(shareTitle('Nhà mình')).toBe('Nhà mình');
  });

  it('collapses whitespace and caps the card copy', () => {
    expect(shareCopy('  Đi   đâu  ', 'một\nhai')).toEqual({
      title: 'Đi đâu',
      description: 'một hai',
    });
    expect(shareCopy('a'.repeat(80), 'b'.repeat(200)).title).toHaveLength(70);
    expect(shareCopy('a'.repeat(80), 'b'.repeat(200)).description).toHaveLength(160);
    expect(shareCopy('   ', '')).toEqual({ title: 'phmtuns', description: '' });
  });

  it('builds one absolute-ready image path from the clamped copy', () => {
    const path = shareImagePath('Đi đâu giờ?', 'Hết ý  tưởng');
    const params = new URLSearchParams(path.slice(path.indexOf('?') + 1));
    expect(path.startsWith('/og?')).toBe(true);
    expect(params.get('title')).toBe('Đi đâu giờ?');
    expect(params.get('description')).toBe('Hết ý tưởng');
  });

  it('keeps title, image and noindex together so a page cannot drop the card', () => {
    const image = shareImagePath('Đi đâu giờ?', 'Hết ý tưởng đi đâu thì bấm xáo nhé.');
    expect(
      shareMeta({
        title: 'Đi đâu giờ?',
        description: 'Hết ý tưởng đi đâu thì bấm xáo nhé.',
        path: '/di-dau',
        index: false,
      }),
    ).toMatchObject({
      title: 'Đi đâu giờ?',
      robots: { index: false, follow: false },
      openGraph: {
        url: '/di-dau',
        images: [{ url: image, width: 1200, height: 630, alt: 'Đi đâu giờ?' }],
      },
      twitter: { card: 'summary_large_image', images: [image] },
    });
  });

  it('leaves indexing alone unless a page opts out', () => {
    expect(shareMeta({ title: 'Nhà', description: 'Một dòng' }).robots).toBeUndefined();
  });

  it('sets the production origin once for every relative share url', () => {
    expect(
      String(rootMeta({ title: 'phmtuns', description: 'Bài tập cho các cháu' }).metadataBase),
    ).toBe('https://www.phmtuns.io.vn/');
  });
});
