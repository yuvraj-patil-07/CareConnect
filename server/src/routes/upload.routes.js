/**
 * Upload Routes — CareConnect AI
 */
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';
import { uploadRateLimiter } from '../middlewares/rateLimiter.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();
router.use(protect);

router.post('/avatar', uploadRateLimiter, uploadAvatar, asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded.', 400));
  res.json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
}));

export default router;
