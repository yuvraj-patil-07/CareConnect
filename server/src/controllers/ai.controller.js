/**
 * AI Controller — CareConnect AI
 * Exposes all AI features via REST API
 */

import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import {
  classifyServiceRequest,
  estimateServicePrice,
  analyzeServiceImage,
  generateHomeHealthReport,
  analyzeReviewSentiment,
  getAIChatbotResponse,
  parseVoiceBookingRequest,
  rankProviders,
} from '../services/ai.service.js';
import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import Provider from '../models/Provider.model.js';
import { AuditLog } from '../models/Skill.model.js';

// ─── Smart Search ─────────────────────────────────────────────────────────────

export const smartSearch = asyncHandler(async (req, res, next) => {
  const { query, location } = req.body;
  if (!query || query.trim().length < 3) {
    return next(new AppError('Please provide a search query of at least 3 characters.', 400));
  }

  const result = await classifyServiceRequest(query, location?.city);

  // Log AI request
  if (req.user) {
    await AuditLog.create({
      user: req.user._id,
      action: 'ai_smart_search',
      details: { query, result },
    });
  }

  res.json({
    success: true,
    data: { analysis: result, query },
  });
});

// ─── Price Estimation ─────────────────────────────────────────────────────────

export const getPriceEstimate = asyncHandler(async (req, res, next) => {
  const { category, subcategory, description, location, urgency, scheduledDate } = req.body;

  const estimate = await estimateServicePrice({
    category, subcategory, description, location, urgency, scheduledDate,
    providerCount: 10,
  });

  res.json({ success: true, data: { estimate } });
});

// ─── Image Analysis ───────────────────────────────────────────────────────────

export const analyzeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image for analysis.', 400));

  const imageUrl = req.file.path; // Cloudinary URL
  const analysis = await analyzeServiceImage(imageUrl);

  res.json({ success: true, data: { analysis, imageUrl } });
});

// ─── Home Health Report ───────────────────────────────────────────────────────

export const getHomeHealthReport = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const completedBookings = await Booking.find({
    customer: req.user._id,
    status: 'completed',
  }).populate('service', 'name').populate('category', 'name').sort('-createdAt').limit(20);

  const serviceHistory = completedBookings.map((b) => ({
    service: b.service?.name,
    category: b.category?.name,
    date: b.completionConfirmedAt,
    cost: b.totalAmount,
  }));

  const report = await generateHomeHealthReport({
    serviceHistory,
    address: user.addresses?.find((a) => a.isDefault) || {},
    homeType: req.body.homeType || 'Apartment',
    age: req.body.homeAge,
    lastServices: serviceHistory.slice(0, 5),
  });

  // Save to user record
  await User.findByIdAndUpdate(req.user._id, {
    'homeHealthScore.score': report.overallScore,
    'homeHealthScore.lastCalculated': new Date(),
    'homeHealthScore.breakdown': report.breakdown,
  });

  res.json({ success: true, data: { report } });
});

// ─── AI Chatbot ───────────────────────────────────────────────────────────────

export const chatWithAI = asyncHandler(async (req, res, next) => {
  const { message, conversationHistory } = req.body;
  if (!message?.trim()) return next(new AppError('Message is required.', 400));

  const userContext = {
    name: req.user?.name,
    role: req.user?.role,
    city: req.user?.city,
    subscription: req.user?.subscription?.plan,
  };

  const response = await getAIChatbotResponse(message, conversationHistory || [], userContext);

  res.json({ success: true, data: { response, timestamp: new Date() } });
});

// ─── Voice Booking ────────────────────────────────────────────────────────────

export const parseVoiceBooking = asyncHandler(async (req, res, next) => {
  const { transcript } = req.body;
  if (!transcript?.trim()) return next(new AppError('Voice transcript is required.', 400));

  const parsed = await parseVoiceBookingRequest(transcript);
  res.json({ success: true, data: { parsed, transcript } });
});

// ─── Provider Ranking ─────────────────────────────────────────────────────────

export const rankProvidersForBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found.', 404));

  const providers = await Provider.find({
    categories: booking.category,
    verificationStatus: 'verified',
    isAvailable: true,
  }).limit(30);

  const ranked = await rankProviders(providers, booking, {});

  res.json({ success: true, data: { ranked } });
});

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

export const analyzeSentiment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  if (!text?.trim()) return next(new AppError('Text is required for sentiment analysis.', 400));

  const result = await analyzeReviewSentiment(text);
  res.json({ success: true, data: { sentiment: result } });
});

// ─── Demand Forecasting (Admin) ───────────────────────────────────────────────

export const getDemandForecast = asyncHandler(async (req, res, next) => {
  const { city, days = 7 } = req.query;

  const historicalData = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        ...(city ? { 'serviceLocation.city': city } : {}),
      },
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          hour: { $hour: '$createdAt' },
          category: '$category',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Simple pattern-based forecasting
  const forecast = {
    peakDays: ['Saturday', 'Sunday', 'Monday'],
    peakHours: ['9-11 AM', '5-8 PM'],
    topCategories: ['AC Service', 'Cleaning', 'Plumbing'],
    predictedBookings: Math.round(historicalData.length * (days / 30) * 1.1),
    data: historicalData,
  };

  res.json({ success: true, data: { forecast } });
});
