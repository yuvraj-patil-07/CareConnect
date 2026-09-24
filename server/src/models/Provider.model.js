/**
 * Provider Model — CareConnect AI
 * Extended profile for service providers
 */

import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: String,
  issueDate: Date,
  expiryDate: Date,
  certificateNumber: String,
  documentUrl: String,
  publicId: String,
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  publicId: String,
  videoUrl: String,
  category: String,
  completedDate: Date,
  likes: { type: Number, default: 0 },
});

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['aadhaar', 'pan', 'driving_license', 'police_verification', 'bank_statement', 'gst', 'other'],
    required: true,
  },
  documentNumber: String,
  documentUrl: String,
  publicId: String,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  uploadedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const pricingTierSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  basePrice: { type: Number, required: true },
  unit: { type: String, enum: ['hour', 'visit', 'sqft', 'unit', 'fixed'], default: 'visit' },
  minPrice: Number,
  maxPrice: Number,
  travelCharge: { type: Number, default: 0 },
  emergencyCharge: { type: Number, default: 0 },
  description: String,
});

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: String,
  accountNumber: { type: String, select: false },
  ifscCode: String,
  bankName: String,
  branchName: String,
  upiId: String,
  isVerified: { type: Boolean, default: false },
});

const providerSchema = new mongoose.Schema({
  // ─── Link to User ──────────────────────────────────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // ─── Professional Info ─────────────────────────────────────────────────────
  businessName: { type: String, trim: true },
  tagline: { type: String, maxlength: 150 },
  bio: { type: String, maxlength: 1000 },
  yearsOfExperience: { type: Number, min: 0, max: 50 },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  languages: [{ type: String }],
  coverImage: { url: String, publicId: String },
  portfolio: [portfolioItemSchema],

  // ─── Verification ─────────────────────────────────────────────────────────
  documents: [documentSchema],
  certificates: [certificateSchema],
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'under_review', 'verified', 'rejected', 'suspended'],
    default: 'unverified',
  },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  backgroundCheckStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'clear', 'flagged'],
    default: 'not_submitted',
  },

  // ─── Location & Service Area ───────────────────────────────────────────────
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  serviceRadius: { type: Number, default: 20 }, // km
  serviceCities: [String],
  serviceAreas: [String],

  // ─── Availability ─────────────────────────────────────────────────────────
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  holidayMode: { type: Boolean, default: false },
  holidayModeUntil: Date,
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
  },

  // ─── Pricing ──────────────────────────────────────────────────────────────
  pricing: [pricingTierSchema],
  acceptsEmergency: { type: Boolean, default: false },
  emergencyPremium: { type: Number, default: 50 }, // percentage

  // ─── Trust Score & Analytics ───────────────────────────────────────────────
  trustScore: { type: Number, min: 0, max: 100, default: 50 },
  trustScoreBreakdown: {
    reviews: { type: Number, default: 0 },
    verification: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    response: { type: Number, default: 0 },
    cancellation: { type: Number, default: 0 },
    aiScore: { type: Number, default: 0 },
  },
  trustScoreLastUpdated: Date,

  // ─── Ratings ──────────────────────────────────────────────────────────────
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },

  // ─── Performance Metrics ───────────────────────────────────────────────────
  stats: {
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    rejectedJobs: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // minutes
    avgJobDuration: { type: Number, default: 0 }, // minutes
    totalEarnings: { type: Number, default: 0 },
    thisMonthEarnings: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    complaintsCount: { type: Number, default: 0 },
  },

  // ─── Financial ────────────────────────────────────────────────────────────
  bankDetails: bankDetailsSchema,
  commission: { type: Number, default: 15 }, // platform commission %
  gstNumber: String,
  panNumber: { type: String, select: false },

  // ─── AI Features ─────────────────────────────────────────────────────────
  aiReliabilityScore: { type: Number, min: 0, max: 100, default: 50 },
  aiRecommendedFor: [String], // AI-suggested service types
  aiSuggestions: [{
    suggestion: String,
    category: String,
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  }],

  // ─── Eco Score ────────────────────────────────────────────────────────────
  ecoScore: {
    score: { type: Number, min: 0, max: 100, default: 50 },
    greenCertified: { type: Boolean, default: false },
    usesEcoProducts: { type: Boolean, default: false },
    carbonOffset: { type: Number, default: 0 },
  },

  // ─── Badges ───────────────────────────────────────────────────────────────
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date,
    description: String,
  }],
  isTopProvider: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isSuperPro: { type: Boolean, default: false },

  // ─── Career ───────────────────────────────────────────────────────────────
  career: {
    incomeGoal: Number,
    currentLevel: { type: String, default: 'beginner' },
    recommendedTrainings: [String],
    certificationSuggestions: [String],
    growthRate: Number,
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ───────────────────────────────────────────────────────────────────
providerSchema.index({ user: 1 });
providerSchema.index({ currentLocation: '2dsphere' });
providerSchema.index({ verificationStatus: 1 });
providerSchema.index({ isAvailable: 1, isOnline: 1 });
providerSchema.index({ averageRating: -1 });
providerSchema.index({ trustScore: -1 });
providerSchema.index({ categories: 1 });
providerSchema.index({ skills: 1 });
providerSchema.index({ serviceCities: 1 });
providerSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
providerSchema.virtual('completionRate').get(function () {
  if (this.stats.totalJobs === 0) return 0;
  return Math.round((this.stats.completedJobs / this.stats.totalJobs) * 100);
});

providerSchema.virtual('isFullyVerified').get(function () {
  return this.verificationStatus === 'verified' && this.backgroundCheckStatus === 'clear';
});

// ─── Methods ──────────────────────────────────────────────────────────────────
providerSchema.methods.calculateTrustScore = function () {
  const { stats, averageRating, verificationStatus, backgroundCheckStatus } = this;

  let score = 0;

  // Rating (30%)
  score += (averageRating / 5) * 30;

  // Completion rate (25%)
  const completionRate = stats.totalJobs > 0 ? (stats.completedJobs / stats.totalJobs) : 0;
  score += completionRate * 25;

  // Verification (20%)
  if (verificationStatus === 'verified') score += 15;
  if (backgroundCheckStatus === 'clear') score += 5;

  // Cancellation rate (15%)
  const cancelRate = stats.totalJobs > 0 ? (stats.cancelledJobs / stats.totalJobs) : 0;
  score += (1 - cancelRate) * 15;

  // Response time (10%)
  const responseScore = Math.max(0, 10 - (stats.avgResponseTime / 60));
  score += Math.min(10, responseScore);

  this.trustScore = Math.round(Math.min(100, Math.max(0, score)));
  return this.trustScore;
};

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
