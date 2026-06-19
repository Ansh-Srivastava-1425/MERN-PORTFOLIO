const express = require('express');
const Timeline = require('../models/Timeline');
const {
  getTimeline,
  addEntry,
  updateEntry,
  deleteEntry,
} = require('../controllers/timelineController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTimeline)
  .post(protect, addEntry);

router.route('/:id')
  .put(protect, updateEntry)
  .delete(protect, deleteEntry);

router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const entry = await Timeline.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timeline entry not found.' });
    entry.isPublished = !entry.isPublished;
    await entry.save();
    res.json({ isPublished: entry.isPublished });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
