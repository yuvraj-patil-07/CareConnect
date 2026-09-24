/**
 * Coupon Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { Coupon } from '../models/Coupon.model.js';

const router = express.Router();
router.use(protect);

router.post('/validate', asyncHandler(async (req, res, next) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return next(new AppError('Invalid coupon code.', 404));
  if (coupon.validUntil < new Date()) return next(new AppError('Coupon has expired.', 400));
  if (orderAmount < coupon.minOrderValue) return next(new AppError(`Minimum order value is ₹${coupon.minOrderValue}.`, 400));
  const userUsed = coupon.usedBy?.filter((u) => u.user?.toString() === req.user._id.toString()).length || 0;
  if (userUsed >= coupon.userUsageLimit) return next(new AppError('Coupon usage limit reached for your account.', 400));
  let discount = 0;
  if (coupon.type === 'percentage') discount = Math.min((orderAmount * coupon.value) / 100, coupon.maxDiscount || Infinity);
  else if (coupon.type === 'flat') discount = Math.min(coupon.value, orderAmount);
  res.json({ success: true, data: { coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount, title: coupon.title } } });
}));

router.get('/active', asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ isActive: true, isPublic: true, validUntil: { $gte: new Date() } }).sort('-createdAt').limit(20);
  res.json({ success: true, data: { coupons } });
}));

router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: { coupon } });
}));

router.patch('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { coupon } });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  await Coupon.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Coupon deactivated.' });
}));

export default router;
