'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Verify the HttpOnly JWT cookie and attach req.user.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.pixelforge_token;
    if (!token) return sendError(res, 'Authentication required', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
