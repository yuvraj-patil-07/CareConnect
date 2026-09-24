/**
 * Service Model — CareConnect AI
 */

import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  shortDescription: { type: String, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  icon: String,
  image: { url: String, publicId: String },
  images: [{ url: String, publicId: String }],
  basePrice: { type: Number, required: true },
  maxPrice: Number,
  priceUnit: { type: String, enum: ['hour', 'visit', 'sqft', 'unit', 'fixed'], default: 'visit' },
  estimatedDuration: Number, // minutes
  requiredSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  tags: [String],
  includes: [String],
  excludes: [String],
  faqs: [{ question: String, answer: String }],
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isEmergencyAvailable: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  searchKeywords: [String],
  seoTitle: String,
  seoDescription: String,
  // AI metadata
  aiClassificationKeywords: [String],
  aiUrgencyIndicators: [String],
}, { timestamps: true, toJSON: { virtuals: true } });

serviceSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

serviceSchema.index({ category: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, isPopular: 1 });
serviceSchema.index({ searchKeywords: 'text', name: 'text', description: 'text', tags: 'text' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
