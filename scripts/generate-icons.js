"use strict";

/**
 * Generate PNG icons untuk PWA tanpa dependency eksternal.
 * Jalankan: node scripts/generate-icons.js
 * Output: assets/icon-192.png dan assets/icon-512.png
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/* ---------- PNG encoder sederhana (RGBA, 8-bit) ---------- */

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(width, height, pixelAt) {
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelAt(x, y);
      const p = row + 1 + x * 4;
      raw[p] = r & 255;
      raw[p + 1] = g & 255;
      raw[p + 2] = b & 255;
      raw[p + 3] = a & 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- Gambar ikon GEMPA MONITOR ---------- */

function drawIcon(size) {
  const half = size / 2;

  const mountainPoints = [
    { x: half - size * 0.34, y: size * 0.86 },
    { x: half, y: size * 0.5 },
    { x: half + size * 0.34, y: size * 0.86 },
  ];
  const smallMountainPoints = [
    { x: half - size * 0.02, y: size * 0.86 },
    { x: half + size * 0.18, y: size * 0.68 },
    { x: half + size * 0.34, y: size * 0.86 },
  ];

  function sign(px, py, a, b) {
    return (px - b.x) * (a.y - b.y) - (a.x - b.x) * (py - b.y);
  }

  function inTriangle(px, py, a, b, c) {
    const d1 = sign(px, py, a, b);
    const d2 = sign(px, py, b, c);
    const d3 = sign(px, py, c, a);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  return encodePNG(size, size, (x, y) => {
    const ny = y / size;

    // Mask: rounded square (superellipse) dengan radius halus
    const sx = (x - half) / half;
    const sy = (y - half) / half;
    const inside = Math.pow(Math.abs(sx), 5) + Math.pow(Math.abs(sy), 5) <= 1;

    // Background: gradient vertical slate-950 -> slate-800
    const t = ny;
    let r = Math.round(2 + (30 - 2) * t);
    let g = Math.round(6 + (41 - 6) * t);
    let b = Math.round(23 + (59 - 23) * t);
    let a = 255;

    // Episenter
    const ecx = half - size * 0.04;
    const ecy = half - size * 0.24;
    const ed = Math.sqrt((x - ecx) ** 2 + (y - ecy) ** 2);

    // Gelombang seismik (ring)
    const ringRadii = [size * 0.2, size * 0.27, size * 0.34];
    for (const rr of ringRadii) {
      if (Math.abs(ed - rr) < size * 0.011) {
        r = 148;
        g = 163;
        b = 184;
        a = 235;
      }
    }

    // Gunung utama (gradient slate)
    if (ny > size * 0.48 && inTriangle(x, y, mountainPoints[0], mountainPoints[1], mountainPoints[2])) {
      const g1 = (ny - size * 0.48) / (size * 0.38);
      r = Math.round(51 + (100 - 51) * g1);
      g = Math.round(65 + (116 - 65) * g1);
      b = Math.round(85 + (141 - 85) * g1);
    }

    // Gunung kecil
    if (ny > size * 0.64 && inTriangle(x, y, smallMountainPoints[0], smallMountainPoints[1], smallMountainPoints[2])) {
      r = 71;
      g = 85;
      b = 105;
    }

    // Salju di puncak gunung utama
    if (inTriangle(x, y, mountainPoints[0], mountainPoints[1], mountainPoints[2]) && ny < size * 0.6) {
      r = 226;
      g = 232;
      b = 240;
    }

    // Episenter: lingkaran oranye -> merah (gradient radial)
    const er = size * 0.2;
    if (ed < er) {
      const grad = ed / er;
      r = Math.round(249 + (239 - 249) * grad);
      g = Math.round(115 + (68 - 115) * grad);
      b = Math.round(22 + (68 - 22) * grad);
      a = 255;
    }

    // Titik tengah putih kekuningan
    if (ed < er * 0.55) {
      r = 253;
      g = 230;
      b = 138;
    }

    if (!inside) a = 0;
    return [r, g, b, a];
  });
}

/* ---------- Output ---------- */

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "icon-192.png"), drawIcon(192));
fs.writeFileSync(path.join(outDir, "icon-512.png"), drawIcon(512));
console.log("Ikon berhasil dibuat: assets/icon-192.png dan assets/icon-512.png");