import express from 'express';
import {
  getProfile,
  upsertProfile,
  addSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProfile)
  .put(protect, upsertProfile);

router.route('/skills')
  .post(protect, addSkill);

router.route('/skills/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

export default router;
