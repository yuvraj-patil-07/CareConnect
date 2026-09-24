/**
 * Notification Model — CareConnect AI
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'booking_created', 'booking_accepted', 'booking_rejected', 'booking_confirmed',
      'booking_started', 'booking_completed', 'booking_cancelled',
      'provider_enroute', 'provider_arrived',
      'quote_received', 'quote_accepted', 'quote_rejected',
      'payment_success', 'payment_failed', 'refund_initiated', 'refund_completed',
      'review_received', 'review_reply',
      'chat_message', 'chat_missed',
      'dispute_opened', 'dispute_resolved',
      'coupon_received', 'cashback_credited',
      'provider_verified', 'provider_rejected',
      'system', 'announcement', 'promo',
      'subscription_expiring', 'subscription_renewed',
      'emergency_accepted', 'emergency_provider_assigned',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Map, of: mongoose.Schema.Types.Mixed },
  image: String,
  deepLink: String,
  actionUrl: String,
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  channel: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
  sentAt: { type: Date, default: Date.now },
  expiresAt: Date,
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
