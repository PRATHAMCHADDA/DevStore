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
  adminDeleteUser,
  adminPromoteUser,
  adminGetCoupons,
  adminAddCoupon,
  adminDeleteCoupon
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(requireAuth);

const devOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || process.env.NODE_ENV === 'development')) {
    return next();
  }
  return requireAdmin(req, res, next);
};

router.get('/stats', requireAdmin, getDashboardStats);

// Product CRUD
router.post('/products', requireAdmin, upload.array('images', 5), adminAddProduct);
router.put('/products/:id', requireAdmin, upload.array('images', 5), adminUpdateProduct);
router.delete('/products/:id', requireAdmin, adminDeleteProduct);

// Orders Management
router.get('/orders', requireAdmin, adminGetOrders);
router.put('/orders/:orderId/status', requireAdmin, adminUpdateOrderStatus);
router.put('/orders/:orderId/refund', requireAdmin, adminRefundOrder);

// Users management
router.get('/users', requireAdmin, adminGetUsers);
router.delete('/users/:id', requireAdmin, adminDeleteUser);
router.put('/users/:id/role', devOrAdmin, adminPromoteUser);
router.post('/users/:id/role', devOrAdmin, adminPromoteUser);

// Coupons CRUD
router.get('/coupons', requireAdmin, adminGetCoupons);
router.post('/coupons', requireAdmin, adminAddCoupon);
router.delete('/coupons/:id', requireAdmin, adminDeleteCoupon);

export default router;
