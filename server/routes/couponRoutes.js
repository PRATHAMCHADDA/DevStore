import express from 'express';
import { getActiveCoupons, validateCoupon } from '../controllers/couponController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getActiveCoupons);
router.post('/validate', requireAuth, validateCoupon);

export default router;
