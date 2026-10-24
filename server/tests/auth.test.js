/**
 * @jest-environment node
 */
'use strict';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/pixelforge_test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only_32_characters_long';
process.env.JWT_EXPIRES_IN = '1d';
process.env.COOKIE_SECRET = 'test_cookie_secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication & Authorization Tests', () => {
  let isDbAvailable = false;
  const testUser = {
    name: 'Pixel Tester',
    email: `tester_${Date.now()}@pixelforge.dev`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      isDbAvailable = true;
    } catch (_) {
      isDbAvailable = false;
    }
  });

  afterAll(async () => {
    if (isDbAvailable) {
      try {
        await User.deleteMany({ email: testUser.email });
        await mongoose.disconnect();
      } catch (_) {}
    }
  });

  test('rejects registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'invalid-email', password: '123' });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test('registers a new user successfully if DB is connected', async () => {
    if (!isDbAvailable) {
      console.log('Skipping DB write test - MongoDB not available');
      return;
    }

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects duplicate email registration', async () => {
    if (!isDbAvailable) return;

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect([400, 409]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test('logs in existing user with correct credentials', async () => {
    if (!isDbAvailable) return;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    if (!isDbAvailable) return;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects unauthorized access to protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
