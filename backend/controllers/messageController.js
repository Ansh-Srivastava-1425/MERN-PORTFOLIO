const Message = require('../models/Message');
const { sendAdminNotification, sendVisitorAutoReply } = require('../utils/sendEmail');

// @desc    Send a contact message
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
  const { senderName, email, message } = req.body;

  try {
    if (!senderName || !email || !message) {
      res.status(400).json({ message: 'Please provide senderName, email, and message.' });
      return;
    }

    const newMessage = await Message.create({
      senderName,
      email,
      message,
    });

    try {
      await sendAdminNotification(senderName, email, message);
      await sendVisitorAutoReply(senderName, email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Do NOT throw — message is already saved, email is non-critical
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/messages
// @access  Private (Protected)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a message as read by ID
// @route   PUT /api/messages/:id
// @access  Private (Protected)
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({ message: 'Message not found.' });
      return;
    }

    message.read = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a message by ID
// @route   DELETE /api/messages/:id
// @access  Private (Protected)
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({ message: 'Message not found.' });
      return;
    }

    await message.deleteOne();
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
};
