/**
 * Remaining Routes — CareConnect AI
 * user, provider, service, category, review, chat, payment, wallet,
 * notification, dispute, admin, analytics, subscription, coupon, upload
 */

// ── user.routes.js ────────────────────────────────────────────────────────────
import express from 'express';
const userRouter = express.Router();
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';
import User from '../models/User.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

userRouter.use(protect);

userRouter.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { user: user.toPublicJSON() } });
}));

userRouter.patch('/profile', asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'bio', 'gender', 'dateOfBirth', 'city', 'language', 'timezone'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: { user: user.toPublicJSON() } });
}));

userRouter.post('/avatar', uploadAvatar, asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image.', 400));
  const user = await User.findByIdAndUpdate(req.user._id, {
    avatar: { url: req.file.path, publicId: req.file.filename },
  }, { new: true });
  res.json({ success: true, data: { avatar: user.avatar } });
}));

userRouter.post('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, data: { addresses: user.addresses } });
}));

userRouter.delete('/addresses/:addressId', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: { _id: req.params.addressId } } });
  res.json({ success: true, message: 'Address removed.' });
}));

userRouter.patch('/preferences', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id,
    { $set: { preferences: req.body } }, { new: true });
  res.json({ success: true, data: { preferences: user.preferences } });
}));

userRouter.post('/favorites/provider/:providerId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.favoriteProviders.indexOf(req.params.providerId);
  if (idx > -1) user.favoriteProviders.splice(idx, 1);
  else user.favoriteProviders.push(req.params.providerId);
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, data: { favoriteProviders: user.favoriteProviders } });
}));

// Admin: get all users
userRouter.get('/', authorize('admin', 'operations_manager', 'support_agent'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'banned') filter.isBanned = true;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort('-createdAt').skip((page-1)*limit).limit(+limit);
  res.json({ success: true, data: { users, total, pages: Math.ceil(total/limit) } });
}));

userRouter.patch('/:id/ban', authorize('admin'), asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id,
    { isBanned: true, banReason: reason, isActive: false }, { new: true });
  res.json({ success: true, message: 'User banned.', data: { user } });
}));

userRouter.patch('/:id/unban', authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id,
    { isBanned: false, banReason: null, isActive: true }, { new: true });
  res.json({ success: true, message: 'User unbanned.', data: { user } });
}));

export default userRouter;
