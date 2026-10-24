'use strict';

const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    defaultOutputFormat: {
      type: String,
      default: 'original',
    },
    notifications: {
      email: { type: Boolean, default: true },
      processingComplete: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    privacy: {
      autoDeleteFiles: { type: Boolean, default: true },
      autoDeleteAfterHours: { type: Number, default: 24, min: 1, max: 168 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);
