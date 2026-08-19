import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getAddresses);
router.post('/', requireAuth, addAddress);
router.put('/:id', requireAuth, updateAddress);
router.delete('/:id', requireAuth, deleteAddress);

export default router;
