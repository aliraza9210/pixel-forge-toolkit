'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * General auth limiter (20 attempts / 15 min / IP) for credential
 * endpoints only — see the /me note below. Moved here from app.js so
 * the session-check route is not counted against the brute-force budget.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

/**
 * Dedicated login rate limiter:
 * Exactly max 3 attempts per 60 seconds per IP.
 * The 4th attempt returns HTTP 429 with standard headers.
 */
const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 3, // 3 requests allowed
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after one minute.',
    });
  },
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginRateLimiter, loginValidation, login);
router.post('/logout', authLimiter, logout);
// SQA FIX (BUG-08, High): GET /me used to share the 20/15-min auth
// limiter with login/register, so normal session checks (checkAuth on
// every page load) could hit 429 and log a legitimate user out. /me is
// authenticated and cookie-bound, so it is not rate-limited here; the
// global 200/15-min limiter still applies.
router.get('/me', authenticate, getMe);

module.exports = router;
