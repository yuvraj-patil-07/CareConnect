/**
 * Review Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { analyzeReviewSentiment } from '../services/ai.service.js';

const router = express.Router();

// Get reviews for a provider
router.get('/provider/:providerId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;
  const filter = { provider: req.params.providerId, isApproved: true, isPublic: true };
  if (rating) filter.overallRating = +rating;
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('customer', 'name avatar')
    .populate('service', 'name')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { reviews, total, pages: Math.ceil(total / limit) } });
}));

// Create review
router.post('/', protect, asyncHandler(async (req, res, next) => {
  const { bookingId, overallRating, comment, qualityRating, punctualityRating, behaviorRating, valueRating, title, tags } = req.body;
  const booking = await Booking.findById(bookingId).populate('provider', '_id');
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (booking.customer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized.', 403));
  if (booking.status !== 'completed') return next(new AppError('Can only review completed bookings.', 400));
  if (booking.hasReview) return next(new AppError('You have already reviewed this booking.', 409));

  // AI sentiment analysis
  const sentiment = await analyzeReviewSentiment(comment);

  const review = await Review.create({
    booking: bookingId,
    customer: req.user._id,
    provider: booking.provider._id,
    service: booking.service,
    overallRating, comment, qualityRating,
    punctualityRating, behaviorRating, valueRating,
    title, tags,
    sentiment: { ...sentiment, analyzedAt: new Date() },
  });

  // Update booking
  await Booking.findByIdAndUpdate(bookingId, { hasReview: true, review: review._id });

  // Update provider average rating
  const { default: Provider } = await import('../models/Provider.model.js');
  const allReviews = await Review.find({ provider: booking.provider._id, isApproved: true });
  const avg = allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length;
  await Provider.findByIdAndUpdate(booking.provider._id, {
    averageRating: Math.round(avg * 10) / 10,
    totalRatings: allReviews.length,
    $inc: { [`ratingDistribution.${overallRating}`]: 1 },
  });

  res.status(201).json({ success: true, data: { review } });
}));

// Vote helpful
router.post('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  const idx = review.votedBy.indexOf(req.user._id);
  if (idx > -1) { review.votedBy.splice(idx, 1); review.helpfulVotes--; }
  else { review.votedBy.push(req.user._id); review.helpfulVotes++; }
  await review.save();
  res.json({ success: true, data: { helpfulVotes: review.helpfulVotes } });
}));

// Provider response
router.post('/:id/response', protect, authorize('provider'), asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id,
    { providerResponse: { comment: req.body.comment, respondedAt: new Date() } },
    { new: true }
  );
  res.json({ success: true, data: { review } });
}));

// Admin: moderate review
router.patch('/:id/moderate', protect, authorize('admin', 'support_agent'), asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id,
    { isApproved: req.body.isApproved, isFlagged: req.body.isFlagged, isFake: req.body.isFake,
      flagReason: req.body.flagReason, moderatedBy: req.user._id, moderatedAt: new Date() },
    { new: true }
  );
  res.json({ success: true, data: { review } });
}));

export default router;
