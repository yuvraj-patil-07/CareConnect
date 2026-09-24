/**
 * Payment & Invoice Models — CareConnect AI
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cash', 'netbanking', 'emi', 'stripe', 'razorpay'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  gatewayTransactionId: String,
  gatewayOrderId: String,
  gatewayPaymentId: String,
  gatewayResponse: { type: Map, of: mongoose.Schema.Types.Mixed },
  failureReason: String,
  refundedAmount: { type: Number, default: 0 },
  refundTransactionId: String,
  refundedAt: Date,
  description: String,
  metadata: { type: Map, of: String },
}, { timestamps: true });

paymentSchema.pre('save', function (next) {
  if (this.isNew && !this.paymentNumber) {
    this.paymentNumber = `PAY${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

paymentSchema.index({ customer: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const invoiceLineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: Number,
  amount: Number,
  taxable: { type: Boolean, default: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  lineItems: [invoiceLineItemSchema],
  subtotal: Number,
  discountAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: Number,
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  dueAmount: Number,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: Date,
  paidAt: Date,
  notes: String,
  terms: String,
  pdfUrl: String,
  pdfPublicId: String,
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    gstin: String,
  },
  providerDetails: {
    name: String,
    businessName: String,
    email: String,
    phone: String,
    address: String,
    gstin: String,
  },
}, { timestamps: true });

invoiceSchema.pre('save', function (next) {
  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = `INV${new Date().getFullYear()}${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ provider: 1 });
invoiceSchema.index({ status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
