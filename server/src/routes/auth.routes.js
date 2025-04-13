// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, resetPassword, forgotPassword } = require('../controllers/auth.controller');

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;