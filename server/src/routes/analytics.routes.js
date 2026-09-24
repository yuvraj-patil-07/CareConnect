/**
 * Analytics Routes — CareConnect AI
 * Platform analytics for admin/ops
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import Provider from '../models/Provider.model.js';

const router = express.Router();
router.use(protect, authorize('admin', 'operations_manager'));

router.get('/overview', asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);
  const createdAtFilter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [bookingStats, userGrowth, categoryBreakdown, topProviders] = await Promise.all([
    Booking.aggregate([
      { $match: createdAtFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$platformFee' } } },
    ]),
    User.aggregate([
      { $match: { role: 'customer', ...createdAtFilter } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Booking.aggregate([
      { $match: createdAtFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    ]),
    Provider.find({ verificationStatus: 'verified' })
      .sort('-stats.totalEarnings -averageRating')
      .limit(10)
      .populate('user', 'name avatar city'),
  ]);

  res.json({ success: true, data: { bookingStats, userGrowth, categoryBreakdown, topProviders } });
}));

router.get('/revenue', asyncHandler(async (req, res) => {
  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'completed', paymentStatus: 'paid' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        grossRevenue: { $sum: '$totalAmount' },
        platformFee: { $sum: '$platformFee' },
        providerPayout: { $sum: '$providerEarning' },
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
  res.json({ success: true, data: { monthlyRevenue } });
}));

export default router;
