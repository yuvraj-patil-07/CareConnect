/**
 * Quote Model — CareConnect AI
 * Multi-provider quote system with negotiation
 */

import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quoteNumber: { type: String, unique: true },
  status: {
    type: String,
    enum: ['pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'counter_offered', 'withdrawn'],
    default: 'sent',
  },
  // Pricing breakdown
  basePrice: { type: Number, required: true },
  laborCost: Number,
  materialCost: Number,
  travelCost: Number,
  emergencyCharge: Number,
  discount: Number,
  totalAmount: { type: Number, required: true },
  gstAmount: Number,
  finalAmount: { type: Number, required: true },

  // Details
  description: { type: String, maxlength: 1000 },
  estimatedDuration: Number, // minutes
  materialsIncluded: [String],
  warrantyDays: { type: Number, default: 0 },
  proposedDate: Date,
  proposedTimeSlot: { start: String, end: String },

  // Negotiation
  negotiationHistory: [{
    offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offeredAt: { type: Date, default: Date.now },
    amount: Number,
    message: String,
    action: { type: String, enum: ['initial', 'counter', 'accepted', 'rejected'] },
  }],
  counterOffer: {
    amount: Number,
    message: String,
    offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offeredAt: Date,
  },

  // Validity
  expiresAt: { type: Date, required: true },
  isExpired: { type: Boolean, default: false },

  // Acceptance
  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  viewedAt: Date,

  // AI Match Score
  aiMatchScore: Number,
  aiMatchReasons: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

quoteSchema.pre('save', function (next) {
  if (this.isNew && !this.quoteNumber) {
    this.quoteNumber = `QT${Date.now().toString(36).toUpperCase()}`;
  }
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
  }
  next();
});

quoteSchema.index({ booking: 1 });
quoteSchema.index({ provider: 1 });
quoteSchema.index({ customer: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ expiresAt: 1 });

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;
