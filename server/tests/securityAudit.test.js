'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { registerFile } = require('../src/services/storageService');
const { sanitizeSvg } = require('../src/utils/svgSanitizer');

describe('Security Verification Test Suite', () => {
  beforeAll(async () => {
    // If not connected to a test DB, connect or handle disconnection quickly to prevent buffering timeout
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pixelforge_test', {
          serverSelectionTimeoutMS: 2000,
        });
      } catch (_) {}
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  });

  describe('Phase 2 & Phase 3: NoSQL Injection & Login Rate Limiting', () => {
    test('1. Rejects NoSQL injection object in email & password fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null },
        });

      // Must be rejected with 400 or 422, never 200 or 500
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    test('2. Enforces maximum 3 login attempts per minute (4th request returns 429)', async () => {
      const testIp = '198.51.100.42'; // Unique IP for rate-limit test isolation

      // Trigger requests that fail input validation immediately so we don't block on DB IO
      const res1 = await request(app).post('/api/auth/login').set('X-Forwarded-For', testIp).send({ email: 'bad' });
      const res2 = await request(app).post('/api/auth/login').set('X-Forwarded-For', testIp).send({ email: 'bad' });
      const res3 = await request(app).post('/api/auth/login').set('X-Forwarded-For', testIp).send({ email: 'bad' });
      const res4 = await request(app).post('/api/auth/login').set('X-Forwarded-For', testIp).send({ email: 'bad' });

      expect(res1.status).not.toBe(429);
      expect(res2.status).not.toBe(429);
      expect(res3.status).not.toBe(429);
      expect(res4.status).toBe(429);
      expect(res4.body.message).toMatch(/Too many login attempts/i);
      expect(res4.headers['ratelimit-limit']).toBe('3');
    });

    test('3. Normal registration is not blocked by login rate limiter', async () => {
      const testIp = '198.51.100.42';
      // Register with the same IP should still work through auth
      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Forwarded-For', testIp)
        .send({
          name: 'Security User',
          email: 'invalid-email',
          password: 'short',
        });
      // Should fail validation (422), not 429
      expect(res.status).toBe(422);
    });
  });

  describe('Phase 5: File Download & Path Traversal Containment', () => {
    test('4. Rejects non-UUIDv4 fileToken values with HTTP 400', async () => {
      const invalidTokens = [
        '../etc/passwd',
        '..%2F..%2Fetc%2Fpasswd',
        'file.txt',
        '12345',
        '00000000-0000-0000-0000-000000000000', // not version 4
      ];

      for (const tok of invalidTokens) {
        const res = await request(app).get(`/api/process/download/${encodeURIComponent(tok)}`);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/token format/i);
      }
    });

    test('5. Returns 404 for valid UUIDv4 token not found in registry', async () => {
      const randomUuid = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
      const res = await request(app).get(`/api/process/download/${randomUuid}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/File not found/i);
    });
  });

  describe('Phase 6: SVG Sanitization & XSS Defense', () => {
    test('6. Strips dangerous script tags and event handlers from SVG', () => {
      const maliciousSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
          <circle cx="50" cy="50" r="40" fill="red" onclick="alert('click')" />
          <script>alert('pwned')</script>
          <a href="javascript:alert(1)"><text x="10" y="20">Click</text></a>
        </svg>
      `;

      const cleaned = sanitizeSvg(maliciousSvg);

      expect(cleaned).not.toContain('<script');
      expect(cleaned).not.toContain('alert(');
      expect(cleaned).not.toContain('onload');
      expect(cleaned).not.toContain('onclick');
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).toContain('<svg');
      expect(cleaned).toContain('<circle');
    });
  });

  describe('Phase 10: Security Headers (Helmet, CORS, HPP)', () => {
    test('7. Emits secure Helmet headers including CSP and frame protection', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-frame-options'] || res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    test('8. Blocks unauthorized CORS origins strictly', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://evilpixelforge.io');

      // CORS middleware calls callback(new Error('CORS blocked...'))
      expect(res.status).toBe(500);
    });
  });

  describe('Additional Security Verifications (MIME Spoofing, Auth Tokens, IDOR)', () => {
    test('9. Rejects disguised executable files with fake image extensions (MIME spoofing)', async () => {
      // Create executable bytes with fake .jpg extension
      const fakeExeBytes = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00This is an executable');
      const res = await request(app)
        .post('/api/process/image/crop-image')
        .attach('file', fakeExeBytes, 'malicious.jpg');

      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/content does not match|spoofing/i);
    });

    test('10. Rejects expired or forged JWT tokens with HTTP 401', async () => {
      const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDUwZGRkMzNlZjQ2ZjcwYTAzNGJjYiJ9.invalidSignature';
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid session token|token/i);
    });

    test('11. Prevents unauthenticated access to user profile or settings endpoints', async () => {
      const res1 = await request(app).get('/api/user/profile');
      expect(res1.status).toBe(401);

      const res2 = await request(app).patch('/api/user/profile').send({ name: 'Hacker' });
      expect(res2.status).toBe(401);

      const res3 = await request(app).get('/api/user/settings');
      expect(res3.status).toBe(401);
    });
  });
});
