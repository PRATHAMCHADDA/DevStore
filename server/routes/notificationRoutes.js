import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.put('/read-all', requireAuth, markAllRead);
router.put('/:id/read', requireAuth, markAsRead);
router.delete('/:id', requireAuth, deleteNotification);

export default router;
