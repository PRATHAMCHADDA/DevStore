import express from 'express';
import { getPaymentConfig, createStripeIntent } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', requireAuth, getPaymentConfig);
router.post('/stripe-intent', requireAuth, createStripeIntent);

export default router;
