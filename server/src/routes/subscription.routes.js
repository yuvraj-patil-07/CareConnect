/**
 * Subscription Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { SubscriptionPlan, Subscription } from '../models/Coupon.model.js';
import User from '../models/User.model.js';

const router = express.Router();
router.use(protect);

router.get('/plans', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  const plans = await SubscriptionPlan.find(filter).sort('sortOrder');
  res.json({ success: true, data: { plans } });
}));

router.get('/my', asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).populate('plan');
  res.json({ success: true, data: { subscription } });
}));

router.post('/subscribe', asyncHandler(async (req, res, next) => {
  const { planId } = req.body;
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) return next(new AppError('Subscription plan not found.', 404));

  const existing = await Subscription.findOne({ user: req.user._id, status: 'active' });
  if (existing) return next(new AppError('You already have an active subscription.', 409));

  const startDate = new Date();
  const endDate = new Date();
  if (plan.billingCycle === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
  else if (plan.billingCycle === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
  else endDate.setFullYear(endDate.getFullYear() + 1);

  const subscription = await Subscription.create({ user: req.user._id, plan: planId, status: 'active', startDate, endDate });
  await User.findByIdAndUpdate(req.user._id, {
    'subscription.plan': plan.name.toLowerCase(), 'subscription.status': 'active',
    'subscription.startDate': startDate, 'subscription.endDate': endDate,
  });
  await subscription.populate('plan');
  res.status(201).json({ success: true, message: `Subscribed to ${plan.name}!`, data: { subscription } });
}));

router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const subscription = await Subscription.findByIdAndUpdate(req.params.id,
    { status: 'cancelled', cancelledAt: new Date(), autoRenew: false, cancellationReason: req.body.reason }, { new: true });
  await User.findByIdAndUpdate(req.user._id, { 'subscription.status': 'cancelled' });
  res.json({ success: true, message: 'Subscription cancelled.', data: { subscription } });
}));

router.post('/plans', authorize('admin'), asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json({ success: true, data: { plan } });
}));

export default router;
