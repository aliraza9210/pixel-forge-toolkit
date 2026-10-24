'use strict';

const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous session
    },
    toolId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'queued',
    },
    inputFileCount: {
      type: Number,
      default: 0,
    },
    outputFileCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    processingTimeMs: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);

processingJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
processingJobSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ProcessingJob', processingJobSchema);
