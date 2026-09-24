/**
 * Dispute Model — CareConnect AI
 */

import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  disputeNumber: { type: String, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  reason: {
    type: String,
    enum: [
      'service_not_completed', 'poor_quality', 'damaged_property',
      'overcharged', 'provider_no_show', 'provider_misconduct',
      'wrong_service', 'safety_concern', 'other',
    ],
    required: true,
  },
  description: { type: String, required: true, maxlength: 2000 },
  evidence: [{
    type: { type: String, enum: ['image', 'video', 'document', 'text'] },
    url: String,
    publicId: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'closed', 'escalated', 'refunded'],
    default: 'open',
    index: true,
  },

  resolution: {
    decision: { type: String, enum: ['favor_customer', 'favor_provider', 'partial', 'no_action'] },
    description: String,
    refundAmount: Number,
    penaltyAmount: Number,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  timeline: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    note: String,
  }],

  adminNotes: [{ note: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: { type: Date, default: Date.now } }],

  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  amount: Number,
  refundRequested: Number,
  refundApproved: Number,

  escalatedAt: Date,
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: Date,
}, { timestamps: true });

disputeSchema.pre('save', function (next) {
  if (this.isNew && !this.disputeNumber) {
    this.disputeNumber = `DS${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

disputeSchema.index({ booking: 1 });
disputeSchema.index({ raisedBy: 1 });
disputeSchema.index({ status: 1, priority: -1 });
disputeSchema.index({ assignedTo: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
