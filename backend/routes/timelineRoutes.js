import express from 'express';
import {
  getTimeline,
  addEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/timelineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getTimeline)
  .post(protect, addEntry);

router.route('/:id')
  .put(protect, updateEntry)
  .delete(protect, deleteEntry);

export default router;
