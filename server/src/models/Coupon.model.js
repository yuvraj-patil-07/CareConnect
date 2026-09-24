/**
 * Coupon & Subscription Models — CareConnect AI
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: String,
  description: String,
  type: { type: String, enum: ['percentage', 'flat', 'free_service', 'cashback'], required: true },
  value: { type: Number, required: true },
  maxDiscount: Number,
  minOrderValue: { type: Number, default: 0 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  userUsageLimit: { type: Number, default: 1 },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date }],
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  terms: String,
  image: String,
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  type: { type: String, enum: ['customer', 'provider'], required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
  features: [{
    name: String,
    description: String,
    icon: String,
    isHighlight: Boolean,
  }],
  freeInspections: { type: Number, default: 0 },
  priorityBooking: { type: Boolean, default: false },
  discountPercentage: { type: Number, default: 0 },
  dedicatedSupport: { type: Boolean, default: false },
  emergencyBookings: { type: Number, default: 0 },
  leadsPerMonth: Number,
  commissionDiscount: Number,
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  color: String,
  icon: String,
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'pending_payment'],
    default: 'active',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  cancelledAt: Date,
  cancellationReason: String,
  usageThisMonth: {
    freeInspections: { type: Number, default: 0 },
    emergencyBookings: { type: Number, default: 0 },
    priorityBookings: { type: Number, default: 0 },
  },
}, { timestamps: true });

subscriptionSchema.index({ user: 1, status: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export const Subscription = mongoose.model('Subscription', subscriptionSchema);
