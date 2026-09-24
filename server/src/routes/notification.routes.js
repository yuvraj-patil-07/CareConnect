/**
 * Notification Routes — CareConnect AI
 */
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import Notification from '../models/Notification.model.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { markNotificationsRead, getUnreadCount } from '../services/notification.service.js';

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { recipient: req.user._id, isDeleted: false };
  if (unread === 'true') filter.isRead = false;
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit);
  const unreadCount = await getUnreadCount(req.user._id);
  res.json({ success: true, data: { notifications, total, unreadCount, pages: Math.ceil(total / limit) } });
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await markNotificationsRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read.' });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  res.json({ success: true, message: 'Notification marked as read.' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  res.json({ success: true, message: 'Notification deleted.' });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.json({ success: true, data: { count } });
}));

export default router;
