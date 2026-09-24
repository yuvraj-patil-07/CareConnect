/**
 * Validation Middleware — CareConnect AI
 * Uses express-validator to handle validation errors
 */

import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new AppError('Validation failed. Please check your input.', 422, formattedErrors));
  }
  next();
};
