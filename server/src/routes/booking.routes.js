/**
 * Booking Routes — CareConnect AI
 */

import express from 'express';
import {
  createBooking, getMyBookings, getBookingById,
  updateBookingStatus, getAvailableBookings,
  addBookingImages, completeJob, cancelBooking, getBookingStats,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { uploadBookingMedia } from '../middlewares/upload.middleware.js';

const router = express.Router();
router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/stats', getBookingStats);
router.get('/available', authorize('provider'), getAvailableBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/images', uploadBookingMedia, addBookingImages);
router.post('/:id/complete', completeJob);

export default router;
