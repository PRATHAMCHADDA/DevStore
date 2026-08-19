import express from 'express';
import {
  placeOrder,
  getOrderHistory,
  getOrderById,
  cancelOrder,
  requestOrderReturn,
  downloadInvoiceFile
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getOrderHistory);
router.post('/', requireAuth, placeOrder);
router.get('/invoice/:orderId', requireAuth, downloadInvoiceFile);
router.get('/:orderId', requireAuth, getOrderById);
router.put('/cancel/:orderId', requireAuth, cancelOrder);
router.post('/return/:orderId', requireAuth, requestOrderReturn);

export default router;
