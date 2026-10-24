/**
 * @jest-environment node
 */
'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.COOKIE_SECRET = 'test_cookie_secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const sharp = require('sharp');
const imageService = require('../src/services/imageService');

describe('Image Processing Service', () => {
  jest.setTimeout(20000);
  let sampleImageBuffer;

  beforeAll(async () => {
    // Generate a 120x80 test PNG image
    sampleImageBuffer = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 4,
        background: { r: 50, g: 150, b: 250, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  test('resizes an image to specified dimensions', async () => {
    const resizedBuffer = await imageService.resizeImage(sampleImageBuffer, {
      width: 60,
      height: 40,
      fit: 'fill',
    });
    const meta = await sharp(resizedBuffer).metadata();
    expect(meta.width).toBe(60);
    expect(meta.height).toBe(40);
  });

  test('crops an image to specified coordinates', async () => {
    const croppedBuffer = await imageService.cropImage(sampleImageBuffer, {
      left: 10,
      top: 10,
      width: 50,
      height: 30,
    });
    const meta = await sharp(croppedBuffer).metadata();
    expect(meta.width).toBe(50);
    expect(meta.height).toBe(30);
  });

  test('rotates and flips an image', async () => {
    const rotatedBuffer = await imageService.rotateFlip(sampleImageBuffer, {
      angle: 90,
      flipH: true,
      flipV: false,
    });
    const meta = await sharp(rotatedBuffer).metadata();
    // 120x80 rotated 90 deg becomes 80x120
    expect(meta.width).toBe(80);
    expect(meta.height).toBe(120);
  });

  test('converts image format to webp and jpeg', async () => {
    const webpBuffer = await imageService.convertAndCompress(sampleImageBuffer, {
      format: 'webp',
      quality: 80,
    });
    const metaWebp = await sharp(webpBuffer).metadata();
    expect(metaWebp.format).toBe('webp');

    const jpegBuffer = await imageService.convertAndCompress(sampleImageBuffer, {
      format: 'jpeg',
      quality: 85,
    });
    const metaJpeg = await sharp(jpegBuffer).metadata();
    expect(metaJpeg.format).toBe('jpeg');
  });

  test('adds watermark to an image', async () => {
    const watermarkedBuffer = await imageService.addWatermark(sampleImageBuffer, {
      text: 'CONFIDENTIAL',
      fontSize: 20,
    });
    const meta = await sharp(watermarkedBuffer).metadata();
    expect(meta.width).toBe(120);
    expect(meta.height).toBe(80);
  });

  test('extracts accurate image metadata and color statistics', async () => {
    const metadata = await imageService.getImageMetadata(sampleImageBuffer);
    expect(metadata.width).toBe(120);
    expect(metadata.height).toBe(80);
    expect(metadata.format).toBe('png');
    expect(metadata.aspectRatio).toBe('3:2');
    expect(metadata.dominantColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(Array.isArray(metadata.palette)).toBe(true);
  });

  test('applies visual filters and borders', async () => {
    const filteredBuffer = await imageService.applyEffects(sampleImageBuffer, {
      grayscale: true,
      blur: 1,
      borderWidth: 5,
      borderColor: '#ff0000',
    });
    const meta = await sharp(filteredBuffer).metadata();
    // 120 + 2*5 = 130, 80 + 2*5 = 90
    expect(meta.width).toBe(130);
    expect(meta.height).toBe(90);
  });
});
