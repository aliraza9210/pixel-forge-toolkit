'use strict';

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { PROCESSED_DIR, generateFilename, registerFile } = require('./storageService');

/**
 * Helper to get a Sharp instance from either a file path or buffer
 */
function getSharp(input) {
  if (typeof input === 'string') {
    return sharp(input);
  }
  return sharp(input);
}

/**
 * 1. Crop Image
 */
async function cropImage(input, { left, top, width, height }) {
  const instance = getSharp(input);
  const meta = await instance.metadata();

  const extractLeft = Math.max(0, Math.min(Math.round(Number(left) || 0), meta.width - 1));
  const extractTop = Math.max(0, Math.min(Math.round(Number(top) || 0), meta.height - 1));
  const extractWidth = Math.min(Math.max(1, Math.round(Number(width) || meta.width)), meta.width - extractLeft);
  const extractHeight = Math.min(Math.max(1, Math.round(Number(height) || meta.height)), meta.height - extractTop);

  return instance.extract({
    left: extractLeft,
    top: extractTop,
    width: extractWidth,
    height: extractHeight,
  }).toBuffer();
}

/**
 * 2. Resize Image
 */
async function resizeImage(input, { width, height, fit = 'inside', withoutEnlargement = false }) {
  const parsedW = width ? parseInt(width, 10) : null;
  const parsedH = height ? parseInt(height, 10) : null;

  const validFits = ['cover', 'contain', 'fill', 'inside', 'outside'];
  const actualFit = validFits.includes(fit) ? fit : 'inside';

  return getSharp(input)
    .resize({
      width: parsedW || undefined,
      height: parsedH || undefined,
      fit: actualFit,
      withoutEnlargement: Boolean(withoutEnlargement),
    })
    .toBuffer();
}

/**
 * 3. Rotate & Flip
 */
async function rotateFlip(input, { angle = 0, flipH = false, flipV = false }) {
  let instance = getSharp(input);

  const numAngle = parseInt(angle, 10) || 0;
  if (numAngle !== 0) {
    instance = instance.rotate(numAngle);
  }

  if (flipV) {
    instance = instance.flip(); // vertical
  }
  if (flipH) {
    instance = instance.flop(); // horizontal
  }

  return instance.toBuffer();
}

/**
 * 4. Add Watermark (Text SVG overlay)
 */
async function addWatermark(input, { text = 'PixelForge', fontSize = 36, color = '#ffffff', opacity = 0.5, gravity = 'southeast' }) {
  const instance = getSharp(input);
  const meta = await instance.metadata();

  const safeText = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const size = Math.max(12, Math.min(144, parseInt(fontSize, 10) || 36));
  const op = Math.max(0.1, Math.min(1.0, parseFloat(opacity) || 0.5));

  const w = meta.width;
  const h = meta.height;
  const maxFont = Math.max(10, Math.floor(Math.min(w, h) / 3));
  const finalSize = Math.max(8, Math.min(maxFont, size));

  const svgWatermark = Buffer.from(`
    <svg width="${w}" height="${h}">
      <text x="50%" y="50%" 
        font-family="sans-serif" 
        font-size="${finalSize}" 
        font-weight="bold" 
        fill="${color}" 
        fill-opacity="${op}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        transform="rotate(-25 ${w / 2} ${h / 2})">
        ${safeText}
      </text>
    </svg>
  `);

  return instance.composite([
    {
      input: svgWatermark,
      gravity: sharp.gravity[gravity] || sharp.gravity.center,
    },
  ]).toBuffer();
}

/**
 * 5. Format Conversion & Compression
 */
async function convertAndCompress(input, { format = 'webp', quality = 85, lossless = false }) {
  const instance = getSharp(input);
  const q = Math.max(1, Math.min(100, parseInt(quality, 10) || 85));

  const target = String(format).toLowerCase().replace('.', '');

  switch (target) {
    case 'jpg':
    case 'jpeg':
      return instance.jpeg({ quality: q, mozjpeg: true }).toBuffer();
    case 'png':
      return instance.png({ quality: q, compressionLevel: 8 }).toBuffer();
    case 'webp':
      return instance.webp({ quality: q, lossless: Boolean(lossless) }).toBuffer();
    case 'avif':
      return instance.avif({ quality: q, lossless: Boolean(lossless) }).toBuffer();
    case 'tiff':
      return instance.tiff({ quality: q }).toBuffer();
    case 'gif':
      return instance.gif().toBuffer();
    default:
      return instance.toFormat(target, { quality: q }).toBuffer();
  }
}

/**
 * 6. Apply Effects & Adjustments
 */
async function applyEffects(input, {
  grayscale = false,
  blur = 0,
  sharpen = 0,
  brightness = 1.0,
  contrast = 1.0,
  saturation = 1.0,
  borderRadius = 0,
  borderColor = null,
  borderWidth = 0,
}) {
  let instance = getSharp(input);

  if (grayscale) {
    instance = instance.grayscale();
  }

  const blurVal = parseFloat(blur);
  if (blurVal > 0.3) {
    instance = instance.blur(Math.min(blurVal, 20));
  }

  const sharpenVal = parseFloat(sharpen);
  if (sharpenVal > 0.3) {
    instance = instance.sharpen(Math.min(sharpenVal, 10));
  }

  const b = parseFloat(brightness) || 1.0;
  const s = parseFloat(saturation) || 1.0;
  if (b !== 1.0 || s !== 1.0) {
    instance = instance.modulate({
      brightness: Math.max(0.1, Math.min(3.0, b)),
      saturation: Math.max(0.0, Math.min(3.0, s)),
    });
  }

  const c = parseFloat(contrast) || 1.0;
  if (c !== 1.0) {
    const clampedC = Math.max(0.2, Math.min(3.0, c));
    instance = instance.linear(clampedC, -(128 * clampedC) + 128);
  }

  // Border
  const bWidth = parseInt(borderWidth, 10) || 0;
  if (bWidth > 0 && borderColor) {
    instance = instance.extend({
      top: bWidth,
      bottom: bWidth,
      left: bWidth,
      right: bWidth,
      background: borderColor,
    });
  }

  // Rounded Corners (if requested)
  const radius = parseInt(borderRadius, 10) || 0;
  if (radius > 0) {
    const meta = await instance.metadata();
    const w = meta.width;
    const h = meta.height;
    const r = Math.min(radius, Math.floor(Math.min(w, h) / 2));

    const maskSvg = Buffer.from(`
      <svg width="${w}" height="${h}">
        <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/>
      </svg>
    `);

    instance = sharp(await instance.png().toBuffer()).composite([
      { input: maskSvg, blend: 'dest-in' },
    ]);
  }

  return instance.toBuffer();
}

/**
 * 7. Change Background Color
 */
async function changeBackground(input, { color = '#ffffff' }) {
  const instance = getSharp(input);
  const meta = await instance.metadata();

  const background = sharp({
    create: {
      width: meta.width,
      height: meta.height,
      channels: 4,
      background: color,
    },
  });

  const inputBuffer = await instance.png().toBuffer();

  return background
    .composite([{ input: inputBuffer, blend: 'over' }])
    .png()
    .toBuffer();
}

/**
 * 7b. Remove Background (Automatic Edge-Preserving Alpha Extraction)
 */
async function removeBackground(input, { tolerance = 30, targetColor = null } = {}) {
  const instance = getSharp(input);
  const { data, info } = await instance
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let bgR = 255, bgG = 255, bgB = 255;

  if (targetColor && targetColor.startsWith('#')) {
    const hex = targetColor.replace('#', '');
    bgR = parseInt(hex.substring(0, 2), 16) || 255;
    bgG = parseInt(hex.substring(2, 4), 16) || 255;
    bgB = parseInt(hex.substring(4, 6), 16) || 255;
  } else {
    // Auto-sample border pixels along top, bottom, left, right edges to determine dominant background tone
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const step = Math.max(1, Math.floor(Math.min(width, height) / 25));
    for (let x = 0; x < width; x += step) {
      const topIdx = x * channels;
      const botIdx = ((height - 1) * width + x) * channels;
      rSum += (data[topIdx] || 0) + (data[botIdx] || 0);
      gSum += (data[topIdx + 1] || 0) + (data[botIdx + 1] || 0);
      bSum += (data[topIdx + 2] || 0) + (data[botIdx + 2] || 0);
      count += 2;
    }
    for (let y = 0; y < height; y += step) {
      const leftIdx = (y * width) * channels;
      const rightIdx = (y * width + (width - 1)) * channels;
      rSum += (data[leftIdx] || 0) + (data[rightIdx] || 0);
      gSum += (data[leftIdx + 1] || 0) + (data[rightIdx + 1] || 0);
      bSum += (data[leftIdx + 2] || 0) + (data[rightIdx + 2] || 0);
      count += 2;
    }
    bgR = count > 0 ? Math.round(rSum / count) : 255;
    bgG = count > 0 ? Math.round(gSum / count) : 255;
    bgB = count > 0 ? Math.round(bSum / count) : 255;
  }

  const numTol = Math.max(5, Math.min(100, Number(tolerance) || 30));
  const tolSq = numTol * numTol * 3;

  // Connected-component Flood-Fill from image boundaries
  // This guarantees interior subject pixels (hair, eyes, beard, clothes) are NEVER punctured
  const totalPixels = width * height;
  const isBg = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let head = 0;
  let tail = 0;

  function tryEnqueue(x, y) {
    const pIdx = y * width + x;
    if (isBg[pIdx] === 0) {
      const dIdx = pIdx * channels;
      const r = data[dIdx];
      const g = data[dIdx + 1];
      const b = data[dIdx + 2];
      const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
      if (distSq <= tolSq) {
        isBg[pIdx] = 1;
        queue[tail++] = pIdx;
      }
    }
  }

  // Enqueue outer border pixels
  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  // Breadth-First Flood Fill outwards from the borders
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    if (cx > 0) tryEnqueue(cx - 1, cy);
    if (cx < width - 1) tryEnqueue(cx + 1, cy);
    if (cy > 0) tryEnqueue(cx, cy - 1);
    if (cy < height - 1) tryEnqueue(cx, cy + 1);
  }

  // Apply transparency only to connected exterior background pixels
  for (let i = 0; i < totalPixels; i++) {
    if (isBg[i] === 1) {
      data[i * channels + 3] = 0; // Transparent
    }
  }

  return sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toBuffer();
}

/**
 * 8. Image Metadata & Analysis
 */
async function getImageMetadata(input) {
  const instance = getSharp(input);
  const meta = await instance.metadata();
  const stats = await instance.stats();

  // Aspect ratio calculation
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  const divisor = gcd(meta.width, meta.height);
  const aspectWidth = meta.width / divisor;
  const aspectHeight = meta.height / divisor;
  const standardAspect = (meta.width / meta.height).toFixed(2);

  // Dominant color palette extraction from channels
  const dominantColors = stats.channels.map((ch, idx) => {
    return Math.round(ch.mean);
  });

  const dominantHex = `#${dominantColors
    .slice(0, 3)
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;

  // Estimate color palette by resizing to 4x4 and taking sample colors
  const { data, info } = await getSharp(input)
    .resize(4, 4, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const palette = [];
  const channels = info.channels;
  for (let i = 0; i < data.length; i += channels * 2) {
    const r = data[i].toString(16).padStart(2, '0');
    const g = data[i + 1].toString(16).padStart(2, '0');
    const b = data[i + 2].toString(16).padStart(2, '0');
    const hex = `#${r}${g}${b}`;
    if (!palette.includes(hex) && palette.length < 6) {
      palette.push(hex);
    }
  }

  return {
    format: meta.format,
    width: meta.width,
    height: meta.height,
    aspectRatio: `${aspectWidth}:${aspectHeight}`,
    decimalAspectRatio: standardAspect,
    space: meta.space,
    channels: meta.channels,
    depth: meta.depth,
    density: meta.density || 72,
    hasAlpha: meta.hasAlpha,
    isOpaque: stats.isOpaque,
    dominantColor: dominantHex,
    palette,
    fileSizeEstimate: meta.size || null,
  };
}

/**
 * 9. Bulk Compress multiple files into a zip
 */
async function bulkCompress(files, { quality = 80, format = 'webp' }) {
  const outFilename = generateFilename('.zip');
  const outPath = path.join(PROCESSED_DIR, outFilename);
  const outputStream = fs.createWriteStream(outPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const streamPromise = new Promise((resolve, reject) => {
    outputStream.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(outputStream);

  const targetExt = format ? `.${format.replace('.', '')}` : '.webp';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const compressedBuffer = await convertAndCompress(file.path, { quality, format });
    const baseName = path.parse(file.originalname).name;
    archive.append(compressedBuffer, { name: `${baseName}_compressed${targetExt}` });
  }

  await archive.finalize();
  await streamPromise;

  return registerFile({
    filename: outFilename,
    originalName: 'PixelForge_bulk_compressed.zip',
    mimeType: 'application/zip',
  });
}

/**
 * 10. Circle Crop
 */
async function circleCrop(input) {
  const meta = await getSharp(input).metadata();
  const size = Math.min(meta.width, meta.height);
  const radius = Math.floor(size / 2);
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#000"/></svg>`
  );
  return getSharp(input)
    .extract({
      left: Math.floor((meta.width - size) / 2),
      top: Math.floor((meta.height - size) / 2),
      width: size,
      height: size,
    })
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/**
 * 11. Round Corners
 */
async function roundCorners(input, { radius = 30 } = {}) {
  const meta = await getSharp(input).metadata();
  const r = Math.min(parseInt(radius, 10) || 30, Math.floor(meta.width / 2), Math.floor(meta.height / 2));
  const rectSvg = Buffer.from(
    `<svg width="${meta.width}" height="${meta.height}"><rect x="0" y="0" width="${meta.width}" height="${meta.height}" rx="${r}" ry="${r}" fill="#000"/></svg>`
  );
  return getSharp(input)
    .composite([{ input: rectSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/**
 * 12. Square Crop
 */
async function squareCrop(input) {
  const meta = await getSharp(input).metadata();
  const size = Math.min(meta.width, meta.height);
  return getSharp(input)
    .extract({
      left: Math.floor((meta.width - size) / 2),
      top: Math.floor((meta.height - size) / 2),
      width: size,
      height: size,
    })
    .toBuffer();
}

/**
 * 13. Add Name & Date to Photo
 */
async function addNameDateToPhoto(input, { name = '', date = '' } = {}) {
  const meta = await getSharp(input).metadata();
  const bannerHeight = Math.max(40, Math.floor(meta.height * 0.12));
  const fontSize = Math.max(14, Math.floor(bannerHeight * 0.35));
  const bannerY = meta.height - bannerHeight;
  const safeName = String(name || 'NAME').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeDate = String(date || new Date().toISOString().slice(0, 10)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svgOverlay = Buffer.from(
    `<svg width="${meta.width}" height="${meta.height}">
      <rect x="0" y="${bannerY}" width="${meta.width}" height="${bannerHeight}" fill="white" opacity="0.95"/>
      <text x="${meta.width / 2}" y="${bannerY + fontSize + 2}" font-family="sans-serif" font-size="${fontSize}px" font-weight="bold" fill="black" text-anchor="middle">${safeName}</text>
      <text x="${meta.width / 2}" y="${bannerY + bannerHeight - 6}" font-family="sans-serif" font-size="${Math.floor(fontSize * 0.85)}px" fill="#333333" text-anchor="middle">DOB/DOA: ${safeDate}</text>
    </svg>`
  );
  return getSharp(input).composite([{ input: svgOverlay, blend: 'over' }]).jpeg({ quality: 95 }).toBuffer();
}

/**
 * 14. Clean / Remove Metadata
 */
async function removeMetadata(input, { format = 'jpeg' } = {}) {
  const targetFmt = format === 'png' ? 'png' : 'jpeg';
  return getSharp(input).withMetadata(false).toFormat(targetFmt, { quality: 90 }).toBuffer();
}

module.exports = {
  cropImage,
  resizeImage,
  rotateFlip,
  addWatermark,
  convertAndCompress,
  applyEffects,
  changeBackground,
  removeBackground,
  getImageMetadata,
  bulkCompress,
  circleCrop,
  roundCorners,
  squareCrop,
  addNameDateToPhoto,
  removeMetadata,
};
