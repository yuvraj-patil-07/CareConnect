/**
 * Booking Controller — CareConnect AI
 * Complete booking lifecycle management
 */

import Booking from '../models/Booking.model.js';
import Provider from '../models/Provider.model.js';
import User from '../models/User.model.js';
import { Chat } from '../models/Chat.model.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { classifyServiceRequest, estimateServicePrice, rankProviders } from '../services/ai.service.js';
import { createNotification, notifyBookingCreated, notifyBookingAccepted } from '../services/notification.service.js';
import { sendEmail } from '../services/email.service.js';

// ─── Create Booking ────────────────────────────────────────────────────────────

export const createBooking = asyncHandler(async (req, res, next) => {
  const {
    service, category, description, scheduledDate, scheduledTimeSlot,
    serviceLocation, isEmergency, isRecurring, recurringPattern,
    couponCode, source,
  } = req.body;

  const io = req.app.get('io');

  // AI classify the request
  const aiAnalysis = await classifyServiceRequest(
    description,
    serviceLocation?.city
  );

  // AI price estimation
  const priceEstimate = await estimateServicePrice({
    category: aiAnalysis.category,
    subcategory: aiAnalysis.subcategory,
    description,
    location: serviceLocation?.city,
    urgency: aiAnalysis.urgencyLevel,
    scheduledDate,
    providerCount: 10,
  });

  // Create booking
  const booking = await Booking.create({
    customer: req.user._id,
    service,
    category,
    description,
    scheduledDate,
    scheduledTimeSlot,
    serviceLocation,
    isEmergency,
    isRecurring,
    recurringPattern,
    couponCode,
    source: source || 'web',
    aiAnalysis: {
      ...aiAnalysis,
      estimatedCostMin: priceEstimate.finalMin,
      estimatedCostMax: priceEstimate.finalMax,
      analyzedAt: new Date(),
    },
    quotedPrice: priceEstimate.recommended,
    status: 'pending',
  });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalBookings': 1 } });

  // Find nearby available providers and notify them
  const nearbyProviders = await Provider.find({
    categories: category,
    verificationStatus: 'verified',
    isAvailable: true,
    'currentLocation': {
      $near: {
        $geometry: { type: 'Point', coordinates: serviceLocation?.coordinates?.coordinates || [72.8777, 19.0760] },
        $maxDistance: 25000, // 25km
      },
    },
  }).limit(20).populate('user', 'name email deviceTokens');

  // Notify providers
  nearbyProviders.forEach((provider) => {
    if (io) {
      io.to(`user:${provider.user._id.toString()}`).emit('booking:new_request', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        category: aiAnalysis.category,
        description: description.substring(0, 100),
        location: serviceLocation?.city,
        scheduledDate,
        estimatedPrice: priceEstimate.recommended,
        urgency: aiAnalysis.urgencyLevel,
        isEmergency,
      });
    }
  });

  // Notify customer
  await notifyBookingCreated(booking, io);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully! Providers will respond shortly.',
    data: {
      booking,
      aiAnalysis,
      priceEstimate,
      nearbyProvidersCount: nearbyProviders.length,
    },
  });
});

// ─── Get Bookings ─────────────────────────────────────────────────────────────

export const getMyBookings = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('service', 'name icon image')
    .populate('category', 'name icon color')
    .populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar phone' },
    })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: { bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

export const getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'name icon image description')
    .populate('category', 'name icon color')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar phone email' } })
    .populate('customer', 'name avatar phone email')
    .populate('review')
    .populate('dispute');

  if (!booking) return next(new AppError('Booking not found.', 404));

  // Check ownership
  const isCustomer = booking.customer._id.toString() === req.user._id.toString();
  const isProvider = booking.provider?.user?._id?.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'operations_manager', 'support_agent'].includes(req.user.role);

  if (!isCustomer && !isProvider && !isAdmin) {
    return next(new AppError('Access denied.', 403));
  }

  res.json({ success: true, data: { booking } });
});

// ─── Update Booking Status ─────────────────────────────────────────────────────

export const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, reason, note } = req.body;
  const io = req.app.get('io');

  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } });

  if (!booking) return next(new AppError('Booking not found.', 404));

  // Validate status transitions
  const validTransitions = {
    pending: ['quotes_received', 'cancelled', 'expired'],
    quotes_received: ['accepted', 'cancelled'],
    accepted: ['confirmed', 'cancelled'],
    confirmed: ['provider_assigned', 'cancelled'],
    provider_assigned: ['provider_enroute', 'cancelled'],
    provider_enroute: ['provider_arrived', 'cancelled'],
    provider_arrived: ['started'],
    started: ['paused', 'completed'],
    paused: ['started', 'completed'],
    completed: ['disputed'],
  };

  const allowed = validTransitions[booking.status];
  if (allowed && !allowed.includes(status)) {
    return next(new AppError(`Cannot transition from '${booking.status}' to '${status}'.`, 400));
  }

  // Update status
  booking.statusHistory.push({
    status,
    changedBy: req.user._id,
    reason,
    note,
    changedAt: new Date(),
  });
  booking.status = status;

  // Handle specific status changes
  if (status === 'provider_enroute') {
    booking.providerEnrouteAt = new Date();
    booking.trackingEnabled = true;
    await createNotification({
      recipient: booking.customer._id,
      type: 'provider_enroute',
      title: '🚗 Provider On The Way!',
      message: `${booking.provider?.user?.name} is heading to your location.`,
      data: { bookingId: booking._id },
      priority: 'high',
      io,
    });
  }

  if (status === 'provider_arrived') {
    booking.providerArrivedAt = new Date();
  }

  if (status === 'started') {
    booking.actualStartTime = new Date();
    booking.timeLogs.push({ action: 'started', timestamp: new Date() });
  }

  if (status === 'completed') {
    booking.actualEndTime = new Date();
    booking.timeLogs.push({ action: 'completed', timestamp: new Date() });
    if (booking.actualStartTime) {
      booking.actualDuration = Math.round((new Date() - booking.actualStartTime) / (1000 * 60));
    }
    booking.trackingEnabled = false;

    // Update provider stats
    await Provider.findByIdAndUpdate(booking.provider, {
      $inc: { 'stats.totalJobs': 1, 'stats.completedJobs': 1 },
    });

    await createNotification({
      recipient: booking.customer._id,
      type: 'booking_completed' ,
      title: '✅ Service Completed!',
      message: 'Your service has been completed. Please review your experience.',
      data: { bookingId: booking._id },
      io,
    });
  }

  if (status === 'cancelled') {
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    booking.trackingEnabled = false;

    await Provider.findByIdAndUpdate(booking.provider, {
      $inc: { 'stats.cancelledJobs': 1 },
    });
  }

  await booking.save();

  // Emit real-time status update
  if (io) {
    io.to(`booking:${booking._id}`).emit('booking:status_update', {
      bookingId: booking._id,
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });
  }

  res.json({ success: true, message: `Booking status updated to '${status}'.`, data: { booking } });
});

// ─── Provider: Get Available Bookings ─────────────────────────────────────────

export const getAvailableBookings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) return next(new AppError('Provider profile not found.', 404));

  const bookings = await Booking.find({
    category: { $in: provider.categories },
    status: 'pending',
    expiresAt: { $gt: new Date() },
    'serviceLocation.coordinates': {
      $near: {
        $geometry: provider.currentLocation,
        $maxDistance: provider.serviceRadius * 1000,
      },
    },
  })
    .populate('service', 'name icon')
    .populate('category', 'name icon')
    .populate('customer', 'name avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, data: { bookings } });
});

// ─── Add Before/After Images ──────────────────────────────────────────────────

export const addBookingImages = asyncHandler(async (req, res, next) => {
  const { type } = req.body; // 'before' | 'after' | 'progress'
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found.', 404));

  const imageData = req.files?.map((f) => ({
    url: f.path,
    publicId: f.filename,
    uploadedAt: new Date(),
  })) || [];

  if (type === 'before') booking.beforeImages.push(...imageData);
  else if (type === 'after') booking.afterImages.push(...imageData);
  else booking.progressImages.push(...imageData);

  await booking.save();
  res.json({ success: true, message: 'Images uploaded successfully.', data: { booking } });
});

// ─── Complete Job with Signature ──────────────────────────────────────────────

export const completeJob = asyncHandler(async (req, res, next) => {
  const { signature, providerNotes, materials } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found.', 404));

  booking.customerSignature = signature;
  booking.providerNotes = providerNotes;
  booking.completionConfirmed = true;
  booking.completionConfirmedAt = new Date();
  if (materials) booking.materials = materials;

  await booking.save();
  res.json({ success: true, message: 'Job marked as complete.', data: { booking } });
});

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const io = req.app.get('io');
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found.', 404));

  if (['completed', 'cancelled', 'refunded'].includes(booking.status)) {
    return next(new AppError(`Cannot cancel a booking with status '${booking.status}'.`, 400));
  }

  booking.status = 'cancelled';
  booking.cancelledBy = req.user._id;
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  booking.statusHistory.push({ status: 'cancelled', changedBy: req.user._id, reason, changedAt: new Date() });
  await booking.save();

  if (io) {
    io.to(`booking:${booking._id}`).emit('booking:cancelled', { bookingId: booking._id, reason });
  }

  res.json({ success: true, message: 'Booking cancelled successfully.', data: { booking } });
});

// ─── Analytics: Booking Stats ─────────────────────────────────────────────────

export const getBookingStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  const filter = role === 'customer'
    ? { customer: userId }
    : role === 'provider'
      ? { provider: (await Provider.findOne({ user: userId }))?._id }
      : {};

  const stats = await Booking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  const monthly = await Booking.aggregate([
    { $match: { ...filter, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data: { stats, monthly } });
});
