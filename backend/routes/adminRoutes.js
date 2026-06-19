const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Timeline = require('../models/Timeline');

router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalProjects,
      totalMessages,
      unreadMessages,
      totalPosts,
      publishedPosts,
      totalTimeline,
    ] = await Promise.all([
      Project.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      Timeline.countDocuments(),
    ]);

    res.json({
      totalProjects,
      totalMessages,
      unreadMessages,
      totalPosts,
      publishedPosts,
      totalTimeline,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
