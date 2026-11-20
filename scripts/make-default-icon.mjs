import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function makeChunk(type, data = Buffer.alloc(0)) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = zlib.crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

const width = 64;
const height = 64;

// IHDR chunk: width, height, bit depth (8), color type (6 = RGBA), compression (0), filter (0), interlace (0)
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6; // RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const scanlines = [];
for (let y = 0; y < height; y++) {
  const row = Buffer.alloc(1 + width * 4);
  row[0] = 0; // Filter: None
  for (let x = 0; x < width; x++) {
    const isBorder = y < 4 || y >= height - 4 || x < 4 || x >= width - 4;
    const offset = 1 + x * 4;
    if (isBorder) {
      row[offset] = 0x00; // R
      row[offset + 1] = 0x00; // G
      row[offset + 2] = 0x00; // B
      row[offset + 3] = 0xff; // A
    } else {
      row[offset] = 0x88; // R
      row[offset + 1] = 0xaa; // G
      row[offset + 2] = 0xee; // B
      row[offset + 3] = 0xff; // A
    }
  }
  scanlines.push(row);
}

const rawData = Buffer.concat(scanlines);
const compressed = zlib.deflateSync(rawData);

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = Buffer.concat([
  pngSignature,
  makeChunk('IHDR', ihdr),
  makeChunk('IDAT', compressed),
  makeChunk('IEND'),
]);

const outPath = path.resolve('public/icon.png');
fs.writeFileSync(outPath, png);
console.log(`Generated ${outPath} (${png.length} bytes)`);
