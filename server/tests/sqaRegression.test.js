'use strict';

/**
 * SQA regression tests — added 2026-11-11 during the independent SQA audit.
 * Each test pins a bug found by live probing so it cannot regress silently:
 *  BUG-02  validation errors in /api/process returned HTTP 500 (now 400)
 *  BUG-03  image output was labelled with the requested format while Sharp
 *          preserved the input format (PNG labelled .webp)
 *  BUG-06  svg-optimizer returned an uploaded SVG verbatim, <script> intact
 *  BUG-08  GET /api/auth/me shared the 20/15-min auth limiter and could 429
 */

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/pixelforge_test';
process.env.JWT_SECRET = 'test_jwt_secret_for_sqa_audit_only_32chars';
process.env.JWT_EXPIRES_IN = '1d';
process.env.COOKIE_SECRET = 'test_cookie_secret_for_sqa_audit_32ch';
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const app = require('../src/app');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function makePdfBuffer(text) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 50, y: 350, size: 14, font, color: rgb(0, 0, 0) });
  return Buffer.from(await doc.save());
}

// Minimal 10x10 red PNG (same fixture shape as the live probes).
function makePngBuffer() {
  const zlib = require('zlib');
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(10, 0);
  ihdr.writeUInt32BE(10, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.concat(Array.from({ length: 10 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(30, 255)])));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('SQA regression (audit 2026-11-11)', () => {
  test('BUG-02: merge-pdf with 1 file returns 400, not 500', async () => {
    const pdf = await makePdfBuffer('one page');
    const res = await request(app)
      .post('/api/process/pdf/merge-pdf')
      .attach('files', pdf, 'a.pdf');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 2 PDF/i);
  });

  test('BUG-02: protect-pdf without a password returns 400, not 500', async () => {
    const pdf = await makePdfBuffer('protect me');
    const res = await request(app)
      .post('/api/process/pdf/protect-pdf')
      .attach('file', pdf, 'a.pdf');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password must be provided/i);
  });

  test('BUG-03: resize-image labels a PNG with its real format, not .webp', async () => {
    const png = makePngBuffer();
    const res = await request(app)
      .post('/api/process/image/resize-image')
      .attach('file', png, 'test.png')
      .field('width', '5')
      .field('height', '5');
    expect(res.status).toBe(200);
    expect(res.body.file.mimeType).toBe('image/png');
    expect(res.body.file.filename).toMatch(/\.png$/);
    // The downloaded bytes must actually be a PNG, not a WebP.
    const dl = await request(app).get(res.body.file.downloadUrl);
    expect(dl.status).toBe(200);
    expect(Buffer.from(dl.body).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });

  test('BUG-06: svg-optimizer strips an embedded <script>', async () => {
    const evil = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="5" cy="5" r="4" fill="red"/></svg>';
    const res = await request(app)
      .post('/api/process/image/svg-optimizer')
      .attach('file', Buffer.from(evil), 'evil.svg');
    expect(res.status).toBe(200);
    const dl = await request(app).get(res.body.file.downloadUrl);
    expect(dl.status).toBe(200);
    const text = Buffer.from(dl.body).toString('utf8');
    expect(text).not.toMatch(/<script/i);
    expect(text).toMatch(/<circle/i);
  });

  test('BUG-08: GET /api/auth/me is not rate-limited after 25 rapid calls', async () => {
    let lastStatus = 0;
    for (let i = 0; i < 25; i++) {
      const res = await request(app).get('/api/auth/me');
      lastStatus = res.status;
      expect(res.status).not.toBe(429);
    }
    // Without a token it must be 401 (unauthenticated), never 429.
    expect(lastStatus).toBe(401);
  });
});
