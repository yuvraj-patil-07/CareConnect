/**
 * Authentication Middleware — CareConnect AI
 * JWT verification + Role-based access control
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { AppError } from './errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Protect routes — verify JWT and attach user to request
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    if (user.isLocked) {
      return next(new AppError('Account is temporarily locked due to multiple failed login attempts.', 423));
    }

    if (user.isBanned) {
      return next(new AppError(`Account has been suspended. Reason: ${user.banReason || 'Policy violation'}`, 403));
    }

    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Please contact support.', 403));
    }

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh your session.', 401));
    }
    logger.error('Auth middleware error:', err);
    next(err);
  }
};

/**
 * Optional auth — attach user if token provided, but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive && !user.isBanned) {
        req.user = user;
      }
    }
  } catch {
    // Silently ignore auth errors for optional routes
  }
  next();
};

/**
 * Role-based access control
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized for this action.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Resource ownership middleware
 * Checks if the user owns the resource
 */
export const checkOwnership = (Model, resourceParam = 'id', userField = 'customer') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[resourceParam]);
      if (!resource) {
        return next(new AppError('Resource not found.', 404));
      }

      const isOwner = resource[userField]?.toString() === req.user._id.toString();
      const isAdmin = ['admin', 'operations_manager', 'support_agent'].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        return next(new AppError('You do not have permission to access this resource.', 403));
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Verify email middleware
 */
export const requireEmailVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your email address to proceed.', 403));
  }
  next();
};

/**
 * Require provider profile
 */
export const requireProviderProfile = async (req, res, next) => {
  try {
    const { default: Provider } = await import('../models/Provider.model.js');
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found. Please complete your profile.', 404));
    }
    req.provider = provider;
    next();
  } catch (err) {
    next(err);
  }
};
