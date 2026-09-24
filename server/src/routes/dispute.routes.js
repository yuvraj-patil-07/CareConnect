/**
 * Dispute Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import Dispute from '../models/Dispute.model.js';
import Booking from '../models/Booking.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();
router.use(protect);

router.post('/', asyncHandler(async (req, res, next) => {
  const { bookingId, reason, description, refundRequested } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (booking.hasDispute) return next(new AppError('A dispute already exists for this booking.', 409));

  const against = booking.customer.toString() === req.user._id.toString()
    ? booking.provider
    : booking.customer;

  const dispute = await Dispute.create({
    booking: bookingId, raisedBy: req.user._id, against,
    provider: booking.provider, reason, description,
    refundRequested, amount: booking.totalAmount,
    timeline: [{ action: 'Dispute opened', performedBy: req.user._id, note: description }],
  });

  await Booking.findByIdAndUpdate(bookingId, { hasDispute: true, dispute: dispute._id, status: 'disputed' });

  res.status(201).json({ success: true, message: 'Dispute opened. Our team will review it within 24 hours.', data: { dispute } });
}));

router.get('/my', asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({
    $or: [{ raisedBy: req.user._id }, { against: req.user._id }],
  })
    .populate('booking', 'bookingNumber service status')
    .sort('-createdAt');
  res.json({ success: true, data: { disputes } });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('booking')
    .populate('raisedBy', 'name avatar')
    .populate('against', 'name avatar')
    .populate('assignedTo', 'name')
    .populate('timeline.performedBy', 'name role');
  if (!dispute) return next(new AppError('Dispute not found.', 404));
  res.json({ success: true, data: { dispute } });
}));

// Upload evidence
router.post('/:id/evidence', asyncHandler(async (req, res, next) => {
  const { type, description } = req.body;
  const disputeId = req.params.id;
  const fileUrl = req.file?.path || req.body.url;
  if (!fileUrl) return next(new AppError('Evidence file or URL is required.', 400));

  const dispute = await Dispute.findByIdAndUpdate(disputeId,
    { $push: { evidence: { type, description, url: fileUrl, uploadedBy: req.user._id } } },
    { new: true }
  );
  res.json({ success: true, data: { evidence: dispute.evidence } });
}));

// Admin routes
router.get('/', authorize('admin', 'support_agent', 'operations_manager'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const total = await Dispute.countDocuments(filter);
  const disputes = await Dispute.find(filter)
    .populate('raisedBy', 'name email')
    .populate('booking', 'bookingNumber')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { disputes, total, pages: Math.ceil(total / limit) } });
}));

router.patch('/:id/resolve', authorize('admin', 'support_agent'), asyncHandler(async (req, res) => {
  const { decision, description, refundAmount, penaltyAmount } = req.body;
  const dispute = await Dispute.findByIdAndUpdate(req.params.id,
    {
      status: 'resolved',
      resolution: { decision, description, refundAmount, penaltyAmount, resolvedAt: new Date(), resolvedBy: req.user._id },
      $push: { timeline: { action: `Resolved: ${decision}`, performedBy: req.user._id, note: description } },
      $push: { adminNotes: { note: description, addedBy: req.user._id } },
    },
    { new: true }
  );
  res.json({ success: true, message: 'Dispute resolved.', data: { dispute } });
}));

router.patch('/:id/assign', authorize('admin', 'operations_manager'), asyncHandler(async (req, res) => {
  const dispute = await Dispute.findByIdAndUpdate(req.params.id,
    { assignedTo: req.body.agentId, status: 'under_review',
      $push: { timeline: { action: 'Assigned to agent', performedBy: req.user._id } } },
    { new: true }
  );
  res.json({ success: true, data: { dispute } });
}));

export default router;
