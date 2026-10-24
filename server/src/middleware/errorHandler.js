'use strict';

const { sendError } = require('../utils/response');

/**
 * Global 404 handler — catches unmatched routes.
 */
function notFoundHandler(req, res) {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
}

/**
 * Global error handler — must have 4 parameters for Express to treat it as error middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 'Validation failed', 422, errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `${field} already exists`, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired', 401);
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
}

module.exports = { notFoundHandler, errorHandler };
