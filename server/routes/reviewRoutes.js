import express from 'express';
import { createReview, deleteReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
