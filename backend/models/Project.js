const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    imageURL: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    liveURL: {
      type: String,
    },
    githubURL: {
      type: String,
    },
    category: {
      type: String,
      enum: ['webdev', 'robotics'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
