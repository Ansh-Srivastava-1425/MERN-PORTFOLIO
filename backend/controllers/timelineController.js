const Timeline = require('../models/Timeline');

// @desc    Get all timeline entries
// @route   GET /api/timeline
// @access  Public
const getTimeline = async (req, res) => {
  try {
    const timeline = await Timeline.find({ isPublished: true }).sort({ from: -1 });
    res.status(200).json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a timeline entry
// @route   POST /api/timeline
// @access  Private (Protected)
const addEntry = async (req, res) => {
  const { title, description, from, to, present } = req.body;

  try {
    if (!title || !description || !from) {
      res.status(400).json({ message: 'Please provide title, description, and from date.' });
      return;
    }

    const entry = await Timeline.create({
      title,
      description,
      from,
      to,
      present,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a timeline entry
// @route   PUT /api/timeline/:id
// @access  Private (Protected)
const updateEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await Timeline.findById(id);

    if (!entry) {
      res.status(404).json({ message: 'Timeline entry not found.' });
      return;
    }

    const updatedEntry = await Timeline.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a timeline entry
// @route   DELETE /api/timeline/:id
// @access  Private (Protected)
const deleteEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await Timeline.findById(id);

    if (!entry) {
      res.status(404).json({ message: 'Timeline entry not found.' });
      return;
    }

    await entry.deleteOne();
    res.status(200).json({ message: 'Timeline entry deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTimeline,
  addEntry,
  updateEntry,
  deleteEntry,
};
