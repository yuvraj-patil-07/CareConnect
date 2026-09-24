/**
 * AI Routes — CareConnect AI
 */

import express from 'express';
import {
  smartSearch, getPriceEstimate, analyzeImage,
  getHomeHealthReport, chatWithAI, parseVoiceBooking,
  rankProvidersForBooking, analyzeSentiment, getDemandForecast,
} from '../controllers/ai.controller.js';
import { protect, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import { aiRateLimiter } from '../middlewares/rateLimiter.js';
import { uploadBookingMedia } from '../middlewares/upload.middleware.js';

const router = express.Router();
router.use(aiRateLimiter);

// Public AI endpoints
router.post('/smart-search', optionalAuth, smartSearch);
router.post('/price-estimate', optionalAuth, getPriceEstimate);

// Protected AI endpoints
router.use(protect);
router.post('/analyze-image', uploadBookingMedia, analyzeImage);
router.get('/home-health', getHomeHealthReport);
router.post('/chat', chatWithAI);
router.post('/voice-booking', parseVoiceBooking);
router.post('/rank-providers/:bookingId', rankProvidersForBooking);
router.post('/sentiment', analyzeSentiment);

// Admin only
router.get('/demand-forecast', authorize('admin', 'operations_manager'), getDemandForecast);

export default router;
