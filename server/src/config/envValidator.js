'use strict';

/**
 * Validates critical environment variables and guards against insecure production defaults.
 * Throws a descriptive Error if production requirements are violated.
 */
function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, enforce mandatory secrets and disallow insecure/dev fallback values
  if (isProduction) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== 'string' || jwtSecret.trim().length < 32) {
      throw new Error(
        'FATAL SECURITY ERROR: JWT_SECRET must be set and contain at least 32 characters in production.'
      );
    }
    if (jwtSecret.includes('dev_') || jwtSecret.includes('change_in_production') || jwtSecret.includes('replace_with')) {
      throw new Error(
        'FATAL SECURITY ERROR: JWT_SECRET contains an insecure placeholder or development default.'
      );
    }

    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret || typeof cookieSecret !== 'string' || cookieSecret.trim().length < 32) {
      throw new Error(
        'FATAL SECURITY ERROR: COOKIE_SECRET must be set and contain at least 32 characters in production.'
      );
    }
    if (cookieSecret.includes('dev_') || cookieSecret.includes('change_in_production') || cookieSecret.includes('replace_with')) {
      throw new Error(
        'FATAL SECURITY ERROR: COOKIE_SECRET contains an insecure placeholder or development default.'
      );
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim().length === 0) {
      throw new Error('FATAL SECURITY ERROR: MONGO_URI must be configured in production.');
    }
  }

  return true;
}

module.exports = { validateEnv };

