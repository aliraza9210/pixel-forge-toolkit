'use strict';

const mongoose = require('mongoose');

const toolUsageEventSchema = new mongoose.Schema(
  {
    toolId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'cancelled'],
      required: true,
    },
    processingTimeMs: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    capped: { size: 10 * 1024 * 1024, max: 100000 }, // 10MB capped collection
  }
);

toolUsageEventSchema.index({ toolId: 1, createdAt: -1 });

module.exports = mongoose.model('ToolUsageEvent', toolUsageEventSchema);
