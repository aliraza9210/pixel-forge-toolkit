'use strict';

/**
 * Standardized API response helpers.
 */
function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendError(res, message = 'Internal server error', statusCode = 500, errors = null) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

function sendCreated(res, data = {}, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

module.exports = { sendSuccess, sendError, sendCreated };
