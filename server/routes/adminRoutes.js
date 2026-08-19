import express from 'express';
import {
  getDashboardStats,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminRefundOrder,
  adminGetUsers,
  adminPromoteUser,
  adminGetCoupons,
  adminAddCoupon,
  adminDeleteCoupon
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply auth and admin check to all routes in this router
router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);

// Product CRUD
router.post('/products', upload.array('images', 5), adminAddProduct);
router.put('/products/:id', upload.array('images', 5), adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// Orders CRUD
router.get('/orders', adminGetOrders);
router.put('/orders/:orderId/status', adminUpdateOrderStatus);
router.put('/orders/:orderId/refund', adminRefundOrder);

// Users promotion
router.get('/users', adminGetUsers);
router.put('/users/:id/role', adminPromoteUser);

// Coupons CRUD
router.get('/coupons', adminGetCoupons);
router.post('/coupons', adminAddCoupon);
router.delete('/coupons/:id', adminDeleteCoupon);

export default router;
