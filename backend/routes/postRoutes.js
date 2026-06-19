const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  getPosts, getPost, getAllPosts,
  createPost, updatePost, uploadCover, deletePost
} = require('../controllers/postController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getPosts);
router.get('/all', protect, getAllPosts);
router.get('/admin/:id', protect, async (req, res) => {
  try {
    const post = await require('../models/Post').findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/:slug', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.post('/:id/cover', protect, upload.single('image'), uploadCover);
router.delete('/:id', protect, deletePost);

module.exports = router;
