/**
 * @jest-environment node
 */
'use strict';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/pixelforge_test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.JWT_EXPIRES_IN = '1d';
process.env.COOKIE_SECRET = 'test_cookie_secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const app = require('../src/app');
const TOOLS_REGISTRY = require('../src/data/toolsRegistry');

// ─── Tools Registry Tests (no DB needed) ──────────────────────────────────────
describe('Tools Registry', () => {
  test('has tools', () => {
    expect(Array.isArray(TOOLS_REGISTRY)).toBe(true);
    expect(TOOLS_REGISTRY.length).toBeGreaterThan(0);
  });

  test('each tool has required fields', () => {
    const requiredFields = ['id', 'name', 'description', 'category', 'icon', 'route', 'implementationStatus'];
    TOOLS_REGISTRY.forEach((tool) => {
      requiredFields.forEach((field) => {
        expect(tool).toHaveProperty(field);
      });
    });
  });

  test('tool IDs are unique', () => {
    const ids = TOOLS_REGISTRY.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('implementationStatus is valid enum', () => {
    const validStatuses = ['available', 'coming-soon'];
    TOOLS_REGISTRY.forEach((tool) => {
      expect(validStatuses).toContain(tool.implementationStatus);
    });
  });
});

// ─── App-level tests (no DB required for these) ───────────────────────────────
describe('App middleware', () => {
  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('CORS headers are present for allowed origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
