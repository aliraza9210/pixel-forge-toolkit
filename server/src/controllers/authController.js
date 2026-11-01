'use strict';

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setCookieAndRespond(res, user, statusCode, message) {
  const token = signToken(user._id);
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('pixelforge_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });

  return res.status(statusCode).json({
    success: true,
    message,
    data: { user },
  });
}

// ─── Validation rules ─────────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2–60 characters'),
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── Controllers ──────────────────────────────────────────────────────────────

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 422, errors.array());
    }

    const { name, email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return sendError(res, 'Invalid input data types', 400);
    }

    const safeEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: safeEmail });
    if (existing) return sendError(res, 'Email is already registered', 409);

    const user = await User.create({ name: String(name).trim(), email: safeEmail, password: String(password) });

    // Create default settings
    await UserSettings.create({ user: user._id });

    return setCookieAndRespond(res, user, 201, 'Account created successfully');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 422, errors.array());
    }

    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return sendError(res, 'Invalid email or password format', 400);
    }

    const safeEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: safeEmail }).select('+password');
    if (!user) return sendError(res, 'Invalid email or password', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);

    if (user.status !== 'active') {
      return sendError(res, 'Your account has been suspended', 403);
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const userObj = user.toJSON();

    return setCookieAndRespond(res, userObj, 200, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie('pixelforge_token', { path: '/' });
  return sendSuccess(res, {}, 'Logged out successfully');
}

async function getMe(req, res) {
  return sendSuccess(res, { user: req.user }, 'User retrieved');
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
};
