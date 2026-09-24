/**
 * Auth Routes — CareConnect AI
 */

import express from 'express';
import {
  register, login, logout, refreshToken,
  verifyEmail, forgotPassword, resetPassword, changePassword,
  googleAuth, resendVerificationEmail, getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authRateLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('role').optional().isIn(['customer', 'provider']).withMessage('Invalid role'),
], validate, register);

router.post('/login', authRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, login);

router.post('/refresh-token', refreshToken);
router.post('/google', googleAuth);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, forgotPassword);
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], validate, resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], validate, changePassword);
router.post('/resend-verification', resendVerificationEmail);

export default router;
