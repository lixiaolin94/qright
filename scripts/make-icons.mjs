// 生成扩展图标：深色圆角底 + 三个二维码定位角 + 右下角一个"箭头"模块。
// 用法：node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZES = [16, 32, 48, 128];
const BG = [24, 119, 242];   // 蓝色底
const FG = [255, 255, 255];
const SS = 4;                // 超采样抗锯齿

// 在 0..1 的单位坐标里描述图形，返回该点颜色或 null（透明）。
function shade(x, y) {
  const r = 0.2;             // 圆角半径
  const cx = Math.min(Math.max(x, r), 1 - r), cy = Math.min(Math.max(y, r), 1 - r);
  if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) return null;

  const m = 0.18, s = 0.28;  // 边距、定位角大小
  const finder = (ox, oy) => {
    const u = (x - ox) / s, v = (y - oy) / s;
    if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    const ring = u < 0.2 || u > 0.8 || v < 0.2 || v > 0.8;
    const core = u > 0.36 && u < 0.64 && v > 0.36 && v < 0.64;
    return ring || core;
  };
  if (finder(m, m) || finder(1 - m - s, m) || finder(m, 1 - m - s)) return FG;

  // 右下角：指向右上的箭头，表示"打开"
  const ax = (x - (1 - m - s)) / s, ay = (y - (1 - m - s)) / s;
  if (ax >= 0 && ax <= 1 && ay >= 0 && ay <= 1) {
    const t = 0.2;
    const head = (ax > 1 - t && ay < 1 - 0.15) || (ay < t && ax > 0.15);
    const shaft = Math.abs(ax - (1 - ay)) < t * 0.75 && ax > 0.05 && ay < 0.95;
    if (head || shaft) return FG;
  }
  return BG;
}

function render(size) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const c = shade((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
      if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
    }
    const i = (y * size + x) * 4, n = SS * SS;
    if (a) { px[i] = r / a; px[i + 1] = g / a; px[i + 2] = b / a; }
    px[i + 3] = Math.round((a / n) * 255);
  }
  return png(size, px);
}

function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) { c ^= byte; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); }
  return ~c >>> 0;
}

for (const size of SIZES) writeFileSync(new URL(`../icons/icon${size}.png`, import.meta.url), render(size));
console.log('icons:', SIZES.join(', '));
