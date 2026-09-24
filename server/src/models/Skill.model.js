/**
 * Skill & AuditLog Models — CareConnect AI
 */

import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  icon: String,
  isActive: { type: Boolean, default: true },
  totalProviders: { type: Number, default: 0 },
  avgHourlyRate: Number,
  demandLevel: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'medium' },
  certificationRequired: { type: Boolean, default: false },
  trainingResources: [String],
}, { timestamps: true });

skillSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  details: { type: Map, of: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failed', 'warning'], default: 'success' },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  metadata: { type: Map, of: String },
}, { timestamps: true });

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ riskLevel: 1 });

export const Skill = mongoose.model('Skill', skillSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
