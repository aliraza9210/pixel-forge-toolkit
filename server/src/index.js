'use strict';

require('dotenv').config();
const { validateEnv } = require('./config/envValidator');
validateEnv();
const app = require('./app');
const { connectDB } = require('./config/database');
const { startCleanupJob } = require('./services/cleanupJob');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('⚠️ MongoDB connection not available. Running in standalone mode (Image & PDF processing tools active).');
    }
    startCleanupJob(30);
    app.listen(PORT, () => {
      console.log(`\n🚀 PixelForge API running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start server', err);
    process.exit(1);
  }
}

startServer();
