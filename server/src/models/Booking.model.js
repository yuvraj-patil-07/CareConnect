/**
 * Booking Model — CareConnect AI
 * Core booking workflow with full status lifecycle
 */

import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  pincode: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
}, { _id: false });

const timeLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['started', 'paused', 'resumed', 'completed'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  note: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
});

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: Number,
  unit: String,
  cost: Number,
  isIncluded: { type: Boolean, default: false }, // included in quote or extra
});

const checklistItemSchema = new mongoose.Schema({
  task: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  note: String,
});

const bookingSchema = new mongoose.Schema({
  // ─── Core References ───────────────────────────────────────────────────────
  bookingNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // ─── Status ───────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'pending',         // Customer created booking, waiting for providers
      'quotes_received', // Providers sent quotes
      'accepted',        // Customer accepted a quote
      'confirmed',       // Provider confirmed
      'provider_assigned',// Ops assigned manually
      'provider_enroute', // Provider is on the way
      'provider_arrived', // Provider arrived at location
      'started',         // Work started
      'paused',          // Work temporarily paused
      'completed',       // Work done, pending payment/review
      'cancelled',       // Cancelled by customer or provider
      'refunded',        // Payment refunded
      'disputed',        // Under dispute
      'no_show',         // Provider didn't show up
      'expired',         // Booking expired without being accepted
    ],
    default: 'pending',
    index: true,
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    note: String,
  }],

  // ─── Scheduling ───────────────────────────────────────────────────────────
  scheduledDate: { type: Date, required: true, index: true },
  scheduledTimeSlot: {
    start: String, // "09:00"
    end: String,   // "11:00"
  },
  isEmergency: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly'] },
    dayOfWeek: Number,
    dayOfMonth: Number,
    endDate: Date,
    parentBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },

  // ─── Location ─────────────────────────────────────────────────────────────
  serviceLocation: locationSchema,

  // ─── Description ──────────────────────────────────────────────────────────
  description: { type: String, required: true, maxlength: 1000 },
  customerNotes: { type: String, maxlength: 500 },
  internalNotes: { type: String, maxlength: 1000 },

  // ─── Media ────────────────────────────────────────────────────────────────
  beforeImages: [{
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  afterImages: [{
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  progressImages: [{
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  // ─── AI Analysis ─────────────────────────────────────────────────────────
  aiAnalysis: {
    predictedIssue: String,
    predictedCategory: String,
    urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    estimatedCostMin: Number,
    estimatedCostMax: Number,
    estimatedDuration: Number, // minutes
    requiredTools: [String],
    predictedProblems: [String],
    confidenceScore: Number,
    analysisType: { type: String, enum: ['text', 'image', 'voice'] },
    rawResponse: String,
    analyzedAt: Date,
  },

  // ─── Pricing & Payment ────────────────────────────────────────────────────
  quotedPrice: Number,
  finalPrice: Number,
  platformFee: Number,
  providerEarning: Number,
  travelCharge: Number,
  emergencyCharge: Number,
  materialCost: Number,
  discount: Number,
  couponCode: String,
  couponDiscount: Number,
  gstAmount: Number,
  gstRate: { type: Number, default: 18 },
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cash', 'netbanking', 'emi'],
  },
  paymentId: String,

  // ─── Job Execution ────────────────────────────────────────────────────────
  checklist: [checklistItemSchema],
  materials: [materialSchema],
  timeLogs: [timeLogSchema],
  progressNotes: [{ note: String, addedAt: { type: Date, default: Date.now } }],
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // minutes

  // ─── Completion ───────────────────────────────────────────────────────────
  customerSignature: String,  // base64 signature
  completionConfirmed: { type: Boolean, default: false },
  completionConfirmedAt: Date,
  providerNotes: { type: String, maxlength: 500 },

  // ─── Review ───────────────────────────────────────────────────────────────
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  hasReview: { type: Boolean, default: false },

  // ─── Cancellation ─────────────────────────────────────────────────────────
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationFee: { type: Number, default: 0 },
  refundAmount: Number,
  refundedAt: Date,

  // ─── Dispute ──────────────────────────────────────────────────────────────
  dispute: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
  hasDispute: { type: Boolean, default: false },

  // ─── Tracking ─────────────────────────────────────────────────────────────
  providerEnrouteAt: Date,
  providerArrivedAt: Date,
  estimatedArrivalTime: Date,
  trackingEnabled: { type: Boolean, default: false },

  // ─── Invoice ──────────────────────────────────────────────────────────────
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  invoiceGenerated: { type: Boolean, default: false },

  // ─── Chat ─────────────────────────────────────────────────────────────────
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },

  // ─── Expiry ───────────────────────────────────────────────────────────────
  expiresAt: Date,

  // ─── Source ───────────────────────────────────────────────────────────────
  source: {
    type: String,
    enum: ['app', 'web', 'voice', 'emergency', 'subscription', 'referral'],
    default: 'web',
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ───────────────────────────────────────────────────────────────────
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ 'serviceLocation.coordinates': '2dsphere' });

// ─── Pre-validate ───────────────────────────────────────────────────────────────
bookingSchema.pre('validate', function (next) {
  if (this.isNew && !this.bookingNumber) {
    this.bookingNumber = `CC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
  next();
});

// ─── Pre-save ─────────────────────────────────────────────────────────────────
bookingSchema.pre('save', function (next) {
  // Auto-expire pending bookings after 2 hours
  if (this.isNew && this.status === 'pending') {
    this.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  next();
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
bookingSchema.virtual('duration').get(function () {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  return this.aiAnalysis?.estimatedDuration || 0;
});

bookingSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && this.expiresAt && new Date() > this.expiresAt;
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
