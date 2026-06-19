const express = require('express');
const {
  getProfile,
  upsertProfile,
  addSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProfile)
  .put(protect, upsertProfile);

router.route('/skills')
  .post(protect, addSkill);

router.route('/skills/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
