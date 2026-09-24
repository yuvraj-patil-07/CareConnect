/**
 * Service Routes — CareConnect AI
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import Service from '../models/Service.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20, popular, featured } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (popular === 'true') filter.isPopular = true;
  if (featured === 'true') filter.isFeatured = true;
  if (search) filter.$text = { $search: search };
  const total = await Service.countDocuments(filter);
  const services = await Service.find(filter)
    .populate('category', 'name icon color')
    .sort(popular === 'true' ? '-totalBookings' : 'sortOrder')
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { services, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name icon color')
    .populate('requiredSkills', 'name');
  if (!service) return next(new AppError('Service not found.', 404));
  res.json({ success: true, data: { service } });
}));

router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: { service } });
}));

router.patch('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { service } });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Service deactivated.' });
}));

export default router;
