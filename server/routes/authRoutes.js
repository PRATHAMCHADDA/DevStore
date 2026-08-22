import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  verifyOTP,
  publicVerifyOTP,
  resendOTP,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { registerValidator, loginValidator, validateRequest } from '../validators/authValidators.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify-otp', requireAuth, verifyOTP);        // Authenticated route (has cookie)
router.post('/verify-otp-public', publicVerifyOTP);        // Public route (email + code)
router.post('/resend-otp', resendOTP);                     // Resend OTP (public)
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/profile', requireAuth, getProfile);
router.get('/me', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;

