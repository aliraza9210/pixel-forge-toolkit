'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  updateProfileValidation,
} = require('../controllers/userController');

router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidation, updateProfile);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

module.exports = router;
