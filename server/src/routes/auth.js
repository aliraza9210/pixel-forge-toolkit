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

router.post('/register', registerValidation, register);
router.post('/login', loginRateLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
