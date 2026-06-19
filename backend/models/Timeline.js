const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
    },
    present: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Timeline = mongoose.model('Timeline', timelineSchema);

module.exports = Timeline;
