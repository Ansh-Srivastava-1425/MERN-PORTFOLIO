const express = require('express');
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

module.exports = router;
