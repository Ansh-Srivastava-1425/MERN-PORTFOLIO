import Profile from '../models/Profile.js';

// @desc    Get the admin profile
// @route   GET /api/profile
// @access  Public
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    // Return null or empty if not found, as requested
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upsert admin profile (create if none, update if exists)
// @route   PUT /api/profile
// @access  Private (Protected)
export const upsertProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (profile) {
      // Update existing
      profile = await Profile.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json(profile);
    } else {
      // Create new
      profile = await Profile.create(req.body);
      res.status(201).json(profile);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add a skill to profile
// @route   POST /api/profile/skills
// @access  Private (Protected)
export const addSkill = async (req, res) => {
  const { name, proficiency } = req.body;

  try {
    const profile = await Profile.findOne();
    if (!profile) {
      res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
      return;
    }

    if (!name || proficiency === undefined) {
      res.status(400).json({ message: 'Please provide skill name and proficiency.' });
      return;
    }

    profile.skills.push({ name, proficiency });
    await profile.save();
    res.status(201).json(profile.skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a skill in profile
// @route   PUT /api/profile/skills/:id
// @access  Private (Protected)
export const updateSkill = async (req, res) => {
  const { name, proficiency } = req.body;
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
    if (proficiency !== undefined) skill.proficiency = proficiency;

    await profile.save();
    res.status(200).json(profile.skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a skill from profile
// @route   DELETE /api/profile/skills/:id
// @access  Private (Protected)
export const deleteSkill = async (req, res) => {
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
