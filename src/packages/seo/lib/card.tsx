import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SHARE_IMAGE, shareCopy } from './meta';

// Satori skips Vietnamese glyphs when the cmap uses range offsets, so this file is one weight with a delta cmap.
const font = readFile(join(process.cwd(), 'assets/og/lexend-700.ttf'));

export async function shareCard(input: { title: string; description: string }) {
  const { title, description } = shareCopy(input.title, input.description);
  const data = await font;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#FFE9D6',
        fontFamily: 'Lexend',
        padding: 48,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          border: '6px solid #000',
          borderRadius: 20,
          boxShadow: '14px 14px 0 #000',
          padding: '56px 64px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700 }}>phmtuns.io.vn</div>
        <div style={{ display: 'flex', flexDirection: 'column', width: 980 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          {description ? (
            <div style={{ display: 'flex', marginTop: 20, fontSize: 32, lineHeight: 1.3 }}>
              {description}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            width: 180,
            height: 18,
            backgroundColor: '#ff7a05',
            border: '4px solid #000',
          }}
        />
      </div>
    </div>,
    {
      ...SHARE_IMAGE,
      fonts: [{ name: 'Lexend', data, weight: 700, style: 'normal' }],
    },
  );
}
