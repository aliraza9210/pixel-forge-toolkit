'use strict';

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Verify the HttpOnly JWT cookie and attach req.user.
 */
async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.pixelforge_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return sendError(res, 'Authentication required', 401);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return sendError(res, 'Authentication system misconfigured', 500);
      }
    }
    const verifiedSecret = secret || 'dev_jwt_secret_change_in_production_32char';
    let decoded;
    try {
      decoded = jwt.verify(token, verifiedSecret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Session token has expired', 401);
      }
      return sendError(res, 'Invalid session token', 401);
    }

    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return sendError(res, 'User not found or invalid session token', 401);
    }

    if (mongoose.connection.readyState !== 1) {
      return sendError(res, 'Database connection offline', 503);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return sendError(res, 'User not found', 401);
    if (user.status !== 'active') return sendError(res, 'Account is not active', 403);

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Role-based authorization middleware factory.
 * @param {...string} roles - Allowed roles.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
