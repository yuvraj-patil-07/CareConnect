/**
 * Wallet Routes — CareConnect AI
 */
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import User from '../models/User.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();
router.use(protect);

// Get wallet balance & transactions
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('wallet referral');
  const { page = 1, limit = 20 } = req.query;
  const total = await WalletTransaction.countDocuments({ user: req.user._id });
  const transactions = await WalletTransaction.find({ user: req.user._id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { wallet: user.wallet, transactions, total } });
}));

// Add money to wallet (initiate top-up)
router.post('/topup', asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount || amount < 100) return next(new AppError('Minimum top-up amount is ₹100.', 400));

  // In production, this would create a Razorpay/Stripe order
  // For now, simulate instant top-up
  const user = await User.findById(req.user._id);
  user.wallet.balance += amount;
  user.wallet.totalEarned += amount;
  await user.save({ validateBeforeSave: false });

  await WalletTransaction.create({
    user: req.user._id, type: 'credit', amount,
    balanceBefore: user.wallet.balance - amount, balanceAfter: user.wallet.balance,
    description: `Wallet top-up of ₹${amount}`,
    status: 'completed',
  });

  res.json({ success: true, message: `₹${amount} added to wallet.`, data: { balance: user.wallet.balance } });
}));

// Transfer coins to cash (100 coins = ₹10)
router.post('/redeem-coins', asyncHandler(async (req, res, next) => {
  const { coins } = req.body;
  if (!coins || coins < 100) return next(new AppError('Minimum redemption is 100 coins.', 400));
  const user = await User.findById(req.user._id);
  if (user.wallet.coins < coins) return next(new AppError('Insufficient coins.', 400));

  const cashAmount = Math.floor(coins / 100) * 10;
  user.wallet.coins -= coins;
  user.wallet.balance += cashAmount;
  await user.save({ validateBeforeSave: false });

  await WalletTransaction.create({
    user: req.user._id, type: 'coins_debit', amount: cashAmount, coins: -coins,
    balanceBefore: user.wallet.balance - cashAmount, balanceAfter: user.wallet.balance,
    coinsBalanceBefore: user.wallet.coins + coins, coinsBalanceAfter: user.wallet.coins,
    description: `Redeemed ${coins} coins for ₹${cashAmount}`,
  });

  res.json({
    success: true,
    message: `${coins} coins redeemed for ₹${cashAmount}.`,
    data: { balance: user.wallet.balance, coins: user.wallet.coins },
  });
}));

export default router;
