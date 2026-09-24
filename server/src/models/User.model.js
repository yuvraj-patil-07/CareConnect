/**
 * User Model — CareConnect AI
 * Master user model with role-based access control
 * Roles: customer | provider | admin | operations_manager | support_agent
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0, min: 0 },
  coins: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalRefunded: { type: Number, default: 0 },
  cashback: { type: Number, default: 0 },
});

const referralSchema = new mongoose.Schema({
  code: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalEarned: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  // ─── Core Identity ──────────────────────────────────────────────────────────
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },

  // ─── Role & Status ───────────────────────────────────────────────────────────
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin', 'operations_manager', 'support_agent'],
    default: 'customer',
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },

  // ─── Authentication ───────────────────────────────────────────────────────────
  googleId: { type: String, sparse: true },
  loginMethod: { type: String, enum: ['email', 'google', 'phone'], default: 'email' },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  phoneOTP: { type: String, select: false },
  phoneOTPExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  refreshTokens: [{ type: String, select: false }],
  lastLogin: Date,
  lastActive: Date,

  // ─── Profile ──────────────────────────────────────────────────────────────────
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  bio: { type: String, maxlength: 500 },
  addresses: [addressSchema],
  defaultLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  city: String,
  timezone: { type: String, default: 'Asia/Kolkata' },
  language: { type: String, default: 'en' },

  // ─── Wallet & Finance ─────────────────────────────────────────────────────────
  wallet: { type: walletSchema, default: () => ({}) },
  referral: { type: referralSchema, default: () => ({}) },

  // ─── Preferences ─────────────────────────────────────────────────────────────
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },

  // ─── Subscription ─────────────────────────────────────────────────────────────
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired'], default: 'inactive' },
    startDate: Date,
    endDate: Date,
    subscriptionId: String,
  },

  // ─── Gamification ─────────────────────────────────────────────────────────────
  badges: [{ type: String }],
  level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
  streak: { type: Number, default: 0 },
  lastStreakDate: Date,
  totalPoints: { type: Number, default: 0 },

  // ─── Statistics ───────────────────────────────────────────────────────────────
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    avgRatingGiven: { type: Number, default: 0 },
  },

  // ─── Smart Home Features ──────────────────────────────────────────────────────
  homeHealthScore: {
    score: { type: Number, min: 0, max: 100, default: 75 },
    lastCalculated: Date,
    breakdown: { type: Map, of: Number },
  },

  // ─── Favorites ────────────────────────────────────────────────────────────────
  favoriteProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  favoriteServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

  // ─── Device Tokens (Push Notifications) ─────────────────────────────────────
  deviceTokens: [{
    token: String,
    platform: { type: String, enum: ['ios', 'android', 'web'] },
    addedAt: { type: Date, default: Date.now },
  }],

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'referral.code': 1 });
userSchema.index({ defaultLocation: '2dsphere' });
userSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('displayName').get(function () {
  return this.name?.split(' ')[0] || 'User';
});

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Hash password
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Generate referral code for new users
  if (this.isNew && !this.referral?.code) {
    this.referral = this.referral || {};
    this.referral.code = this._generateReferralCode();
  }

  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

userSchema.methods._generateReferralCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CC';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.refreshTokens;
  delete obj.phoneOTP;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
