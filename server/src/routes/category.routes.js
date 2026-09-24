import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import Category from '../models/Category.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { parent, featured, popular } = req.query;
  const filter = { isActive: true };
  if (parent === 'null' || parent === 'top') filter.parent = null;
  else if (parent) filter.parent = parent;
  if (featured === 'true') filter.isFeatured = true;
  if (popular === 'true') filter.isPopular = true;
  const categories = await Category.find(filter)
    .populate('parent', 'name slug')
    .sort('sortOrder');
  res.json({ success: true, data: { categories } });
}));

router.get('/tree', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder');
  const tree = categories.filter(c => !c.parent).map(parent => ({
    ...parent.toObject(),
    children: categories.filter(c => c.parent?.toString() === parent._id.toString()),
  }));
  res.json({ success: true, data: { tree } });
}));

router.get('/:slug', asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return next(new AppError('Category not found.', 404));
  const children = await Category.find({ parent: category._id, isActive: true });
  res.json({ success: true, data: { category, children } });
}));

router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: { category } });
}));

router.patch('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { category } });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category deactivated.' });
}));

export default router;
