/**
 * Review Model — CareConnect AI
 * Reviews with AI sentiment analysis and media support
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

  // Ratings
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  qualityRating: { type: Number, min: 1, max: 5 },
  punctualityRating: { type: Number, min: 1, max: 5 },
  behaviorRating: { type: Number, min: 1, max: 5 },
  valueRating: { type: Number, min: 1, max: 5 },

  // Content
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  tags: [{ type: String }], // 'professional', 'punctual', 'clean', etc.

  // Media
  photos: [{ url: String, publicId: String }],
  videos: [{ url: String, publicId: String }],

  // AI Sentiment
  sentiment: {
    score: Number,    // -1 to 1
    label: { type: String, enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'] },
    keywords: [String],
    analyzedAt: Date,
  },

  // Moderation
  isApproved: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  isFake: { type: Boolean, default: false },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,

  // Interaction
  helpfulVotes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Provider Response
  providerResponse: {
    comment: { type: String, maxlength: 500 },
    respondedAt: Date,
  },

  // Visibility
  isPublic: { type: Boolean, default: true },
  isAnonymous: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

reviewSchema.index({ provider: 1, isApproved: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ service: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ overallRating: -1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
