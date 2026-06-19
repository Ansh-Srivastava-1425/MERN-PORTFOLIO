const express = require('express');
const Project = require('../models/Project');
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

router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    project.isPublished = !project.isPublished;
    await project.save();
    res.json({ isPublished: project.isPublished });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
