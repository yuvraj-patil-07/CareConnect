/**
 * Admin Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import User from '../models/User.model.js';
import Booking from '../models/Booking.model.js';
import Provider from '../models/Provider.model.js';
import { AuditLog } from '../models/Skill.model.js';

const router = express.Router();
router.use(protect, authorize('admin', 'operations_manager', 'support_agent'));

// Dashboard overview
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totalUsers, totalProviders, totalBookings, pendingVerifications] = await Promise.all([
    User.countDocuments({ role: 'customer', isDeleted: false }),
    Provider.countDocuments(),
    Booking.countDocuments(),
    Provider.countDocuments({ verificationStatus: 'pending' }),
  ]);

  const revenueResult = await Booking.aggregate([
    { $match: { status: 'completed', paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$platformFee' } } },
  ]);

  const todayBookings = await Booking.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$platformFee' }, bookings: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const recentBookings = await Booking.find().sort('-createdAt').limit(10)
    .populate('customer', 'name avatar')
    .populate('service', 'name')
    .select('bookingNumber status totalAmount createdAt serviceLocation');

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalProviders, totalBookings, pendingVerifications, todayBookings },
      revenue: revenueResult[0]?.total || 0,
      monthlyRevenue,
      recentBookings,
    },
  });
}));

// Audit logs
router.get('/audit-logs', authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find().populate('user', 'name email role').sort('-createdAt').skip((page - 1) * limit).limit(+limit);
  res.json({ success: true, data: { logs, total } });
}));

// Platform settings
router.get('/settings', authorize('admin'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      platformFeePercent: 15,
      gstRate: 18,
      maxRadius: 50,
      quoteExpiryHours: 4,
      bookingExpiryHours: 2,
      minProviderRating: 3.5,
      emergencyFeePercent: 50,
      maxQuotesPerBooking: 10,
    },
  });
}));

// Announcements
router.post('/announcements', authorize('admin'), asyncHandler(async (req, res) => {
  const { title, message, targetRole, priority } = req.body;
  const users = await User.find(targetRole ? { role: targetRole } : {}).select('_id');
  const { createBulkNotifications } = await import('../services/notification.service.js');
  const notifications = users.map((u) => ({
    recipient: u._id, type: 'announcement', title, message, priority: priority || 'normal',
    channel: ['in_app', 'email'],
  }));
  await createBulkNotifications(notifications, req.app.get('io'));
  res.json({ success: true, message: `Announcement sent to ${users.length} users.` });
}));

export default router;
