import express from 'express';
import { getSalesAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getSalesAnalytics);

export default router;
