/**
 * Rate Limiter Middleware — CareConnect AI
 * Multiple rate limiters for different endpoints
 */

import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler.js';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      next(new AppError(options.message.message, 429));
    },
  });

// General API limiter
export const globalRateLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests from this IP. Please try again later.'
);

// Strict limiter for auth routes
export const authRateLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

// OTP limiter
export const otpRateLimiter = createLimiter(
  10 * 60 * 1000, // 10 minutes
  5,
  'Too many OTP requests. Please wait 10 minutes before requesting again.'
);

// Password reset limiter
export const passwordResetLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset requests. Please try again after 1 hour.'
);

// AI route limiter
export const aiRateLimiter = createLimiter(
  60 * 1000, // 1 minute
  20,
  'AI request limit reached. Please slow down.'
);

// File upload limiter
export const uploadRateLimiter = createLimiter(
  60 * 1000,
  30,
  'Upload limit reached. Please wait before uploading more files.'
);
