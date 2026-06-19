const express = require('express');
const {
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, upload.single('image'), addProject);

router.route('/:id')
  .get(getProject)
  .put(protect, upload.single('image'), updateProject)
  .delete(protect, deleteProject);

module.exports = router;
