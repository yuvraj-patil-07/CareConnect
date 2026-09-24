/**
 * Auth Controller — CareConnect AI
 * Complete authentication with JWT, refresh tokens, Google OAuth, OTP
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import Provider from '../models/Provider.model.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { sendEmail } from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../config/logger.js';

// ─── Token Generators ──────────────────────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });

const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token (keep max 5 devices)
  user.refreshTokens = user.refreshTokens || [];
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Build provider profile if needed
  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = await Provider.findOne({ user: user._id }).select('verificationStatus trustScore averageRating');
  }

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toPublicJSON(),
      provider: providerProfile,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '15m',
    },
  });
};

// ─── Register ──────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role, referralCode } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ $or: [{ email }, { phone: phone || null }] });
  if (existingUser) {
    return next(new AppError(
      existingUser.email === email
        ? 'An account with this email already exists.'
        : 'An account with this phone number already exists.',
      409
    ));
  }

  // Validate role (only customer & provider via public API)
  const allowedRoles = ['customer', 'provider'];
  if (role && !allowedRoles.includes(role)) {
    return next(new AppError('Invalid role selected.', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'customer',
  });

  // Handle referral
  if (referralCode) {
    const referrer = await User.findOne({ 'referral.code': referralCode.toUpperCase() });
    if (referrer) {
      user.referral.referredBy = referrer._id;
      referrer.referral.referrals.push(user._id);
      referrer.wallet.coins += 100; // Referral reward
      referrer.wallet.totalEarned += 100;
      await referrer.save({ validateBeforeSave: false });
      user.wallet.coins += 50; // Signup bonus for referred user
    }
  }

  // Create provider profile if role is provider
  if (user.role === 'provider') {
    await Provider.create({ user: user._id });
  }

  // Send verification email
  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Welcome to CareConnect AI — Verify Your Email',
    template: 'welcome',
    data: { name: user.name, verifyURL },
  }).catch((err) => logger.error('Welcome email failed:', err.message));

  // Notify
  await createNotification({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to CareConnect AI! 🎉',
    message: `Hi ${user.name}! Your account is ready. Verify your email to unlock all features.`,
  });

  logger.info(`New user registered: ${user.email} (${user.role})`);
  await sendTokenResponse(user, 201, res, 'Account created successfully! Please verify your email.');
});

// ─── Login ─────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password +refreshTokens +loginAttempts +lockUntil');

  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.isLocked) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(new AppError(`Account locked. Try again in ${lockTime} minutes.`, 423));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    await user.incrementLoginAttempts();
    return next(new AppError('Invalid email or password.', 401));
  }

  // Reset login attempts on success
  if (user.loginAttempts > 0 || user.lockUntil) {
    await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
  }

  // Adjust token expiry based on remember me
  if (rememberMe) {
    process.env.JWT_EXPIRE = '30d';
    process.env.JWT_REFRESH_EXPIRE = '90d';
  }

  logger.info(`User logged in: ${user.email}`);
  await sendTokenResponse(user, 200, res, 'Login successful!');
});

// ─── Refresh Token ─────────────────────────────────────────────────────────────

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  if (!token) return next(new AppError('Refresh token is required.', 400));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    return next(new AppError('Refresh token not recognized. Please log in again.', 401));
  }

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

// ─── Logout ────────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  const user = await User.findById(req.user._id).select('+refreshTokens');
  if (user && token) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save({ validateBeforeSave: false });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── Verify Email ──────────────────────────────────────────────────────────────

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Email verification link is invalid or has expired.', 400));

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.wallet.coins += 25; // Email verification bonus
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully! You earned 25 coins.' });
});

// ─── Forgot Password ───────────────────────────────────────────────────────────

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Return success even if user not found (security)
    return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'CareConnect AI — Password Reset Request',
      template: 'passwordReset',
      data: { name: user.name, resetURL, expiresIn: '10 minutes' },
    });
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    logger.error('Password reset email failed:', err);
    next(new AppError('Failed to send reset email. Please try again.', 500));
  }
});

// ─── Reset Password ────────────────────────────────────────────────────────────

export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+refreshTokens');

  if (!user) return next(new AppError('Password reset link is invalid or has expired.', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'CareConnect AI — Password Changed Successfully',
    template: 'passwordChanged',
    data: { name: user.name },
  }).catch(() => {});

  await sendTokenResponse(user, 200, res, 'Password reset successfully. You are now logged in.');
});

// ─── Change Password ───────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +refreshTokens');

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) return next(new AppError('Current password is incorrect.', 401));

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  await sendTokenResponse(user, 200, res, 'Password changed successfully.');
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export const googleAuth = asyncHandler(async (req, res, next) => {
  const { idToken, role } = req.body;

  // Verify Google token
  const { OAuth2Client } = await import('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return next(new AppError('Invalid Google token.', 401));
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+refreshTokens');

  if (!user) {
    // Create new user
    user = await User.create({
      googleId,
      name,
      email,
      avatar: { url: picture },
      isVerified: true,
      loginMethod: 'google',
      role: role || 'customer',
    });

    if (user.role === 'provider') {
      await Provider.create({ user: user._id });
    }

    await createNotification({
      recipient: user._id,
      type: 'system',
      title: 'Welcome to CareConnect AI! 🎉',
      message: `Hi ${user.name}! Your account has been created via Google.`,
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
      user.loginMethod = 'google';
    }
    if (!user.avatar?.url && picture) {
      user.avatar = { url: picture };
    }
  }

  await sendTokenResponse(user, 200, res, 'Google authentication successful!');
});

// ─── Resend Verification ───────────────────────────────────────────────────────

export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.isVerified) return next(new AppError('Email already verified.', 400));

  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: 'CareConnect AI — Verify Your Email',
    template: 'welcome',
    data: { name: user.name, verifyURL },
  });

  res.json({ success: true, message: 'Verification email sent successfully.' });
});

// ─── Get Current User ──────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('favoriteProviders', 'user trustScore averageRating')
    .populate('favoriteServices', 'name category basePrice');

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = await Provider.findOne({ user: user._id })
      .populate('categories', 'name icon')
      .populate('skills', 'name icon');
  }

  res.json({
    success: true,
    data: { user: user.toPublicJSON(), provider: providerProfile },
  });
});
