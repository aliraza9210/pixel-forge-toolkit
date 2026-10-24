'use strict';

const { sweepExpiredFiles } = require('./storageService');

let intervalId = null;

function startCleanupJob(intervalMinutes = 30) {
  if (intervalId) return;

  // Run initial sweep on launch
  const initialCleaned = sweepExpiredFiles();
  if (initialCleaned > 0) {
    console.log(`🧹 [Cleanup] Initial sweep removed ${initialCleaned} expired file(s)`);
  }

  // Set recurring interval
  intervalId = setInterval(() => {
    try {
      const cleaned = sweepExpiredFiles();
      if (cleaned > 0) {
        console.log(`🧹 [Cleanup] Swept ${cleaned} expired temporary file(s)`);
      }
    } catch (err) {
      console.error('❌ [Cleanup] Sweep error:', err.message);
    }
  }, intervalMinutes * 60 * 1000);

  // Prevent keeping Node process awake in tests
  if (process.env.NODE_ENV === 'test' && intervalId.unref) {
    intervalId.unref();
  }
}

function stopCleanupJob() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = {
  startCleanupJob,
  stopCleanupJob,
};
