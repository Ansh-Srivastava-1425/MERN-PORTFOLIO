const Project = require('../models/Project');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// Helper to parse technologies list robustly
const parseTechnologies = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech;
  if (typeof tech === 'string') {
    try {
      const parsed = JSON.parse(tech);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // split by comma
      return tech.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
};

// @desc    Get all projects (with optional category filter)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  const { category } = req.query;

  try {
    const filter = { isPublished: true };
    if (category) {
      filter.category = category;
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found.' });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Project ID or retrieval error.' });
  }
};

// @desc    Create a project (with Cloudinary image upload via memory storage)
// @route   POST /api/projects
// @access  Private (Protected)
const addProject = async (req, res) => {
  const { title, description, technologies, liveURL, githubURL, category, featured } = req.body;

  try {
    if (!title || !description || !category) {
      res.status(400).json({ message: 'Please provide title, description, and category.' });
      return;
    }

    let imageURL, imagePublicId;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageURL = result.secure_url;
      imagePublicId = result.public_id;
    }

    const project = await Project.create({
      title,
      description,
      technologies: parseTechnologies(technologies),
      imageURL,
      imagePublicId,
      liveURL,
      githubURL,
      category,
      featured: featured === 'true' || featured === true,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a project (handles new image upload & deletes old one)
// @route   PUT /api/projects/:id
// @access  Private (Protected)
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, technologies, liveURL, githubURL, category, featured } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found.' });
      return;
    }

    // Update textual properties
    if (title) project.title = title;
    if (description) project.description = description;
    if (technologies) project.technologies = parseTechnologies(technologies);
    if (liveURL !== undefined) project.liveURL = liveURL;
    if (githubURL !== undefined) project.githubURL = githubURL;
    if (category) project.category = category;
    if (featured !== undefined) {
      project.featured = featured === 'true' || featured === true;
    }
    if (req.body.isPublished !== undefined) {
      project.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    }

    // Handle new image upload & delete old one
    if (req.file) {
      if (project.imagePublicId) {
        await cloudinary.uploader.destroy(project.imagePublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      project.imageURL = result.secure_url;
      project.imagePublicId = result.public_id;
    }

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a project & remove associated Cloudinary image
// @route   DELETE /api/projects/:id
// @access  Private (Protected)
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found.' });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    await project.deleteOne();
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
};
