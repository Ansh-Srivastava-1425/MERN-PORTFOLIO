const Profile = require('../models/Profile');

// @desc    Get the admin profile
// @route   GET /api/profile
// @access  Public
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upsert admin profile (create if none, update if exists)
// @route   PUT /api/profile
// @access  Private (Protected)
const upsertProfile = async (req, res) => {
  console.log('upsertProfile called with body:', JSON.stringify(req.body));
  try {
    let profile = await Profile.findOne();

    if (profile) {
      // Don't overwrite avatar, resumeUrl, resumePublicId 
      // with empty values
      const updateData = { ...req.body };
      if (!updateData.avatar) delete updateData.avatar;
      if (!updateData.resumeUrl) delete updateData.resumeUrl;
      if (!updateData.resumePublicId) delete updateData.resumePublicId;

      profile = await Profile.findOneAndUpdate({}, updateData, {
        new: true,
        runValidators: true,
      });
      console.log('Profile saved:', JSON.stringify(profile));
      res.status(200).json(profile);
    } else {
      // Create new
      profile = await Profile.create(req.body);
      console.log('Profile saved:', JSON.stringify(profile));
      res.status(201).json(profile);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add a skill to profile
// @route   POST /api/profile/skills
// @access  Private (Protected)
const addSkill = async (req, res) => {
  const { name, proficiency } = req.body;

  try {
    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
      return;
    }

    if (!name) {
      res.status(400).json({ message: 'Please provide skill name.' });
      return;
    }

    profile.skills.push({ name });
    await profile.save();
    res.status(201).json(profile.skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a skill in profile
// @route   PUT /api/profile/skills/:id
// @access  Private (Protected)
const updateSkill = async (req, res) => {
  const { name } = req.body;
  const skillId = req.params.id;

  try {
    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    const skill = profile.skills.id(skillId);
    if (!skill) {
      res.status(404).json({ message: 'Skill not found.' });
      return;
    }

    if (name !== undefined) skill.name = name;

    await profile.save();
    res.status(200).json(profile.skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a skill from profile
// @route   DELETE /api/profile/skills/:id
// @access  Private (Protected)
const deleteSkill = async (req, res) => {
  const skillId = req.params.id;

  try {
    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    const skill = profile.skills.id(skillId);
    if (!skill) {
      res.status(404).json({ message: 'Skill not found.' });
      return;
    }

    profile.skills.pull(skillId);
    await profile.save();
    res.status(200).json(profile.skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  upsertProfile,
  addSkill,
  updateSkill,
  deleteSkill,
};
