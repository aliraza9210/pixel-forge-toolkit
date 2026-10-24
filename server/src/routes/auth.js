'use strict';

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
