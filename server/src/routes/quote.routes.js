/**
 * Quote Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import Quote from '../models/Quote.model.js';
import Booking from '../models/Booking.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();
router.use(protect);

// Provider sends a quote for a booking
router.post('/', authorize('provider'), asyncHandler(async (req, res, next) => {
  const { bookingId, basePrice, laborCost, materialCost, travelCost, totalAmount, finalAmount,
    description, estimatedDuration, materialsIncluded, warrantyDays, proposedDate, proposedTimeSlot } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (!['pending', 'quotes_received'].includes(booking.status)) {
    return next(new AppError('This booking is no longer accepting quotes.', 400));
  }

  const { default: Provider } = await import('../models/Provider.model.js');
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) return next(new AppError('Provider profile not found.', 404));

  // Check if already quoted
  const existing = await Quote.findOne({ booking: bookingId, provider: provider._id });
  if (existing) return next(new AppError('You have already submitted a quote for this booking.', 409));

  const gstAmount = (finalAmount || totalAmount) * 0.18;

  const quote = await Quote.create({
    booking: bookingId, provider: provider._id, customer: booking.customer,
    basePrice, laborCost, materialCost, travelCost,
    totalAmount: totalAmount || basePrice,
    gstAmount,
    finalAmount: finalAmount || (totalAmount + gstAmount),
    description, estimatedDuration, materialsIncluded, warrantyDays,
    proposedDate, proposedTimeSlot,
    negotiationHistory: [{ offeredBy: req.user._id, amount: finalAmount || totalAmount, action: 'initial', offeredAt: new Date() }],
  });

  // Update booking status
  if (booking.status === 'pending') {
    await Booking.findByIdAndUpdate(bookingId, { status: 'quotes_received' });
  }

  const io = req.app.get('io');
  await createNotification({
    recipient: booking.customer,
    type: 'quote_received',
    title: '💰 New Quote Received!',
    message: `A provider has sent a quote of ₹${quote.finalAmount} for your booking.`,
    data: { bookingId, quoteId: quote._id },
    deepLink: `/bookings/${bookingId}/quotes`,
    priority: 'high',
    io,
  });

  res.status(201).json({ success: true, message: 'Quote submitted successfully.', data: { quote } });
}));

// Get quotes for a booking
router.get('/booking/:bookingId', asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ booking: req.params.bookingId })
    .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar phone' } })
    .sort('-createdAt');
  res.json({ success: true, data: { quotes } });
}));

// Accept a quote
router.patch('/:id/accept', asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id).populate('booking');
  if (!quote) return next(new AppError('Quote not found.', 404));
  if (quote.customer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized.', 403));
  if (quote.isExpired || quote.expiresAt < new Date()) return next(new AppError('This quote has expired.', 400));

  quote.status = 'accepted';
  quote.acceptedAt = new Date();
  await quote.save();

  // Update booking with provider and price
  await Booking.findByIdAndUpdate(quote.booking._id, {
    provider: quote.provider,
    status: 'accepted',
    finalPrice: quote.finalAmount,
    totalAmount: quote.finalAmount,
    gstAmount: quote.gstAmount,
  });

  // Reject all other quotes
  await Quote.updateMany(
    { booking: quote.booking._id, _id: { $ne: quote._id } },
    { status: 'rejected', rejectedAt: new Date() }
  );

  const io = req.app.get('io');
  const { default: Provider } = await import('../models/Provider.model.js');
  const provider = await Provider.findById(quote.provider).populate('user', 'name');

  await createNotification({
    recipient: provider.user._id,
    type: 'quote_accepted',
    title: '🎉 Your Quote Was Accepted!',
    message: `Your quote of ₹${quote.finalAmount} has been accepted. Get ready!`,
    data: { bookingId: quote.booking._id, quoteId: quote._id },
    priority: 'high',
    io,
  });

  res.json({ success: true, message: 'Quote accepted! Provider confirmed.', data: { quote } });
}));

// Reject a quote
router.patch('/:id/reject', asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return next(new AppError('Quote not found.', 404));
  if (quote.customer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized.', 403));

  quote.status = 'rejected';
  quote.rejectedAt = new Date();
  quote.rejectionReason = req.body.reason;
  await quote.save();

  res.json({ success: true, message: 'Quote rejected.', data: { quote } });
}));

// Counter offer
router.post('/:id/counter', asyncHandler(async (req, res, next) => {
  const { amount, message } = req.body;
  const quote = await Quote.findById(req.params.id);
  if (!quote) return next(new AppError('Quote not found.', 404));

  quote.status = 'counter_offered';
  quote.counterOffer = { amount, message, offeredBy: req.user._id, offeredAt: new Date() };
  quote.negotiationHistory.push({ offeredBy: req.user._id, amount, message, action: 'counter', offeredAt: new Date() });
  await quote.save();

  res.json({ success: true, message: 'Counter offer sent.', data: { quote } });
}));

export default router;
