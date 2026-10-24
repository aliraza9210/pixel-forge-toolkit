'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/response');

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const isDbConnected = dbStatus === 1;

  return res.status(200).json({
    success: true,
    status: isDbConnected ? 'healthy' : 'degraded',
    message: isDbConnected ? 'All services fully operational' : 'Database offline; operating in standalone in-memory mode',
    db: dbStates[dbStatus],
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
