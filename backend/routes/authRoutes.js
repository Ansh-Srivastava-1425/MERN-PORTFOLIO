const express = require('express');
const {
  registerAdmin,
  login,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
