/**
 * Category Model — CareConnect AI
 */

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, maxlength: 500 },
  icon: String,         // icon class or URL
  image: { url: String, publicId: String },
  coverImage: { url: String, publicId: String },
  color: { type: String, default: '#2563eb' },
  gradientFrom: String,
  gradientTo: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  totalServices: { type: Number, default: 0 },
  totalProviders: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  priceRange: { min: Number, max: Number },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  searchKeywords: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isPopular: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
