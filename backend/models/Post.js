const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  readTime: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
