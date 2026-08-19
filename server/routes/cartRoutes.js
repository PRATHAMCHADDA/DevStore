import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getCart);
router.post('/add', requireAuth, addToCart);
router.put('/update', requireAuth, updateCartItemQuantity);
router.delete('/clear', requireAuth, clearCart);
router.delete('/:productId', requireAuth, removeFromCart);

export default router;
