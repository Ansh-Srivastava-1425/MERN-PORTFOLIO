const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const slugify = require('slugify');

// Public — get all published posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .select('-content')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public — get single post by slug
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — get all posts including drafts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().select('-content').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — create post
const createPost = async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const readTime = Math.ceil(content.split(' ').length / 200) + ' min read';
    const post = await Post.create({
      title, slug, excerpt, content,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      published: published === 'true' || published === true,
      readTime,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — update post
const updatePost = async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    const updates = {
      excerpt, content,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      published: published === 'true' || published === true,
    };
    if (title) {
      updates.title = title;
      updates.slug = slugify(title, { lower: true, strict: true });
      updates.readTime = Math.ceil(content.split(' ').length / 200) + ' min read';
    }
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — upload cover image
const uploadCover = async (req, res) => {
  try {
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'portfolio/blog' },
        async (error, result) => {
          if (error) return res.status(500).json({ message: error.message });
          await Post.findByIdAndUpdate(req.params.id, {
            coverImage: result.secure_url,
            coverImagePublicId: result.public_id,
          });
          res.json({ coverImage: result.secure_url });
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.coverImagePublicId) {
      await cloudinary.uploader.destroy(post.coverImagePublicId);
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPosts, getPost, getAllPosts,
  createPost, updatePost, uploadCover, deletePost
};
