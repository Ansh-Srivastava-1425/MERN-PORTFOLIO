const express = require('express');
const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(sendMessage)
  .get(protect, getMessages);

router.route('/:id')
  .put(protect, markAsRead)
  .delete(protect, deleteMessage);

module.exports = router;
