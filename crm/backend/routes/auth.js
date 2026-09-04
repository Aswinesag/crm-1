const express = require('express');
const { login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password',forgotPassword)
router.post('/reset-password/:id/:token',resetPassword)
 
module.exports = router;
