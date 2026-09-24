/**
 * Provider Routes — CareConnect AI
 */

import express from 'express';
import { protect, authorize, requireProviderProfile } from '../middlewares/auth.middleware.js';
import { uploadPortfolio, uploadDocuments, uploadAvatar } from '../middlewares/upload.middleware.js';
import Provider from '../models/Provider.model.js';
import User from '../models/User.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();

// ─── Public Provider Search ────────────────────────────────────────────────────
router.get('/search', asyncHandler(async (req, res) => {
  const {
    lat, lng, radius = 25, category, skill,
    minRating = 0, maxPrice, sortBy = 'trustScore',
    page = 1, limit = 12, language, available,
  } = req.query;

  const filter = { verificationStatus: 'verified' };
  if (category) filter.categories = category;
  if (skill) filter.skills = skill;
  if (minRating) filter.averageRating = { $gte: +minRating };
  if (available === 'true') filter.isAvailable = true;
  if (language) filter.languages = { $in: [language] };

  let query = Provider.find(filter);

  if (lat && lng) {
    query = Provider.find({
      ...filter,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [+lng, +lat] },
          $maxDistance: +radius * 1000,
        },
      },
    });
  }

  const sortMap = {
    trustScore: '-trustScore',
    rating: '-averageRating',
    experience: '-yearsOfExperience',
    newest: '-createdAt',
  };

  const total = await Provider.countDocuments(filter);
  const providers = await query
    .populate('user', 'name avatar city')
    .populate('categories', 'name icon')
    .populate('skills', 'name')
    .sort(sortMap[sortBy] || '-trustScore')
    .skip((page - 1) * limit)
    .limit(+limit)
    .select('-bankDetails -documents');

  res.json({ success: true, data: { providers, total, pages: Math.ceil(total / limit) } });
}));

// ─── Public Provider Profile ───────────────────────────────────────────────────
router.get('/:id/public', asyncHandler(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id)
    .populate('user', 'name avatar city createdAt')
    .populate('categories', 'name icon color')
    .populate('skills', 'name icon')
    .select('-bankDetails -documents -panNumber');
  if (!provider) return next(new AppError('Provider not found.', 404));
  res.json({ success: true, data: { provider } });
}));

// Protected routes
router.use(protect);

// ─── My Provider Profile ───────────────────────────────────────────────────────
router.get('/me', authorize('provider'), requireProviderProfile, asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id })
    .populate('categories', 'name icon')
    .populate('skills', 'name icon')
    .populate('services', 'name basePrice');
  res.json({ success: true, data: { provider } });
}));

router.patch('/me', authorize('provider'), requireProviderProfile, asyncHandler(async (req, res) => {
  const allowed = [
    'businessName', 'tagline', 'bio', 'yearsOfExperience',
    'skills', 'categories', 'services', 'languages',
    'serviceRadius', 'serviceCities', 'serviceAreas',
    'isAvailable', 'acceptsEmergency', 'workingHours', 'gstNumber',
  ];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const provider = await Provider.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
  res.json({ success: true, data: { provider } });
}));

// Update current location
router.patch('/me/location', authorize('provider'), asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) return res.status(400).json({ success: false, message: 'Coordinates required.' });
  const provider = await Provider.findOneAndUpdate(
    { user: req.user._id },
    { currentLocation: { type: 'Point', coordinates: [+longitude, +latitude] }, isOnline: true },
    { new: true }
  );
  res.json({ success: true, data: { location: provider.currentLocation } });
}));

// Upload portfolio
router.post('/me/portfolio', authorize('provider'), uploadPortfolio, asyncHandler(async (req, res) => {
  const items = req.files?.map((f) => ({
    imageUrl: f.path,
    publicId: f.filename,
    title: req.body.title || 'Portfolio Item',
    category: req.body.category,
  })) || [];
  const provider = await Provider.findOneAndUpdate(
    { user: req.user._id },
    { $push: { portfolio: { $each: items } } },
    { new: true }
  );
  res.json({ success: true, data: { portfolio: provider.portfolio } });
}));

// Upload document
router.post('/me/documents', authorize('provider'), uploadDocuments, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Document required.' });
  const doc = {
    type: req.body.type,
    documentNumber: req.body.documentNumber,
    documentUrl: req.file.path,
    publicId: req.file.filename,
    status: 'pending',
  };
  const provider = await Provider.findOneAndUpdate(
    { user: req.user._id },
    { $push: { documents: doc } },
    { new: true }
  );
  if (provider.verificationStatus === 'unverified') {
    provider.verificationStatus = 'pending';
    await provider.save();
  }
  res.json({ success: true, message: 'Document uploaded successfully. Awaiting review.', data: { documents: provider.documents } });
}));

// Toggle holiday mode
router.patch('/me/holiday-mode', authorize('provider'), asyncHandler(async (req, res) => {
  const { enabled, until } = req.body;
  const provider = await Provider.findOneAndUpdate(
    { user: req.user._id },
    { holidayMode: enabled, holidayModeUntil: until ? new Date(until) : null, isAvailable: !enabled },
    { new: true }
  );
  res.json({ success: true, data: { holidayMode: provider.holidayMode } });
}));

// Analytics dashboard data
router.get('/me/analytics', authorize('provider'), requireProviderProfile, asyncHandler(async (req, res) => {
  const Booking = (await import('../models/Booking.model.js')).default;
  const provider = req.provider;

  const monthlyEarnings = await Booking.aggregate([
    { $match: { provider: provider._id, status: 'completed' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$providerEarning' },
        jobs: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.json({ success: true, data: { stats: provider.stats, monthly: monthlyEarnings, trustScore: provider.trustScore } });
}));

// Admin: verify provider
router.patch('/:id/verify', authorize('admin', 'operations_manager'), asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const provider = await Provider.findByIdAndUpdate(req.params.id,
    { verificationStatus: status, verifiedAt: status === 'verified' ? new Date() : null, rejectionReason: reason || null },
    { new: true }
  );
  res.json({ success: true, data: { provider } });
}));

// Admin: get all providers
router.get('/', authorize('admin', 'operations_manager', 'support_agent'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.verificationStatus = status;
  const total = await Provider.countDocuments(filter);
  const providers = await Provider.find(filter)
    .populate('user', 'name email phone avatar')
    .populate('categories', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit)
    .select('-bankDetails -documents');
  res.json({ success: true, data: { providers, total, pages: Math.ceil(total / limit) } });
}));

export default router;
