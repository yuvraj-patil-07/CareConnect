/**
 * Wallet Transaction Model — CareConnect AI
 */

import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transactionNumber: { type: String, unique: true },
  type: {
    type: String,
    enum: [
      'credit', 'debit', 'refund', 'cashback', 'referral_reward',
      'coins_credit', 'coins_debit', 'coupon_applied', 'subscription_payment',
      'booking_payment', 'provider_payout',
    ],
    required: true,
  },
  amount: { type: Number, required: true },
  coins: { type: Number, default: 0 },
  balanceBefore: Number,
  balanceAfter: Number,
  coinsBalanceBefore: Number,
  coinsBalanceAfter: Number,
  description: { type: String, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: { type: String, enum: ['Booking', 'Payment', 'Coupon', 'Dispute'] },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'completed' },
  metadata: { type: Map, of: String },
}, { timestamps: true });

walletTransactionSchema.pre('save', function (next) {
  if (this.isNew && !this.transactionNumber) {
    this.transactionNumber = `TXN${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
