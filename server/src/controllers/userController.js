'use strict';

const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { sendSuccess, sendError } = require('../utils/response');

const updateProfileValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2–60 characters'),
];

async function getProfile(req, res) {
  return sendSuccess(res, { user: req.user }, 'Profile retrieved');
}

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());

    const { name } = req.body;
    const update = {};
    if (name && typeof name === 'string') update.name = String(name).trim();

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    let settings = await UserSettings.findOne({ user: req.user._id });
    if (!settings) settings = await UserSettings.create({ user: req.user._id });
    return sendSuccess(res, { settings });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const allowed = ['theme', 'defaultOutputFormat', 'notifications', 'privacy'];
    const update = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user._id },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, { settings }, 'Settings updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, getSettings, updateSettings, updateProfileValidation };
