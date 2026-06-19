const express = require('express');
const Profile = require('../models/Profile');
const {
  getProfile,
  upsertProfile,
  addSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const { cloudinary, upload } = require('../config/cloudinary');

router.route('/')
  .get(getProfile)
  .put(protect, upsertProfile);

router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'portfolio/avatar' },
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json({ url: result.secure_url });
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    if (profile.resumePublicId) {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'portfolio/resume', 
        resource_type: 'raw',
        public_id: `resume-${Date.now()}` 
      },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        try {
          profile.resumeUrl = result.secure_url;
          profile.resumePublicId = result.public_id;
          await profile.save();
          res.json({ resumeUrl: result.secure_url });
        } catch (saveErr) {
          res.status(500).json({ message: saveErr.message });
        }
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/resume', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    if (profile.resumePublicId) {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    }

    profile.resumeUrl = '';
    profile.resumePublicId = '';
    await profile.save();

    res.json({ message: 'Resume removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/og-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    if (profile.seo && profile.seo.ogImagePublicId) {
      await cloudinary.uploader.destroy(profile.seo.ogImagePublicId);
    }

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'portfolio/og',
        public_id: `og-${Date.now()}`
      },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        try {
          if (!profile.seo) {
            profile.seo = {};
          }
          profile.seo.ogImage = result.secure_url;
          profile.seo.ogImagePublicId = result.public_id;
          await profile.save();
          res.json({ ogImage: result.secure_url });
        } catch (saveErr) {
          res.status(500).json({ message: saveErr.message });
        }
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route('/skills')
  .post(protect, addSkill);

router.route('/skills/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
