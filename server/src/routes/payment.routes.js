/**
 * Payment Routes — CareConnect AI
 * Stripe-ready payment processing
 */
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { Payment, Invoice } from '../models/Payment.model.js';
import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();
router.use(protect);

// Initiate payment
router.post('/initiate', asyncHandler(async (req, res, next) => {
  const { bookingId, method, amount } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (booking.customer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized.', 403));

  // Wallet payment
  if (method === 'wallet') {
    const user = await User.findById(req.user._id);
    if (user.wallet.balance < amount) return next(new AppError('Insufficient wallet balance.', 400));

    user.wallet.balance -= amount;
    user.wallet.totalSpent += amount;
    await user.save({ validateBeforeSave: false });

    const payment = await Payment.create({
      booking: bookingId, customer: req.user._id,
      amount, method: 'wallet', status: 'success',
      description: `Payment for booking #${booking.bookingNumber}`,
    });

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid', paidAmount: amount, paymentId: payment._id, paymentMethod: 'wallet',
    });

    await WalletTransaction.create({
      user: req.user._id, type: 'debit', amount,
      balanceBefore: user.wallet.balance + amount, balanceAfter: user.wallet.balance,
      description: `Booking #${booking.bookingNumber} payment`, reference: bookingId, referenceModel: 'Booking',
    });

    const io = req.app.get('io');
    await createNotification({
      recipient: req.user._id, type: 'payment_success',
      title: '✅ Payment Successful!',
      message: `₹${amount} paid via wallet for booking #${booking.bookingNumber}.`,
      io,
    });

    return res.json({ success: true, message: 'Payment successful via wallet.', data: { payment } });
  }

  // Stripe payment intent
  if (method === 'card') {
    try {
      const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // paise
        currency: 'inr',
        metadata: { bookingId: bookingId.toString(), customerId: req.user._id.toString() },
      });

      const payment = await Payment.create({
        booking: bookingId, customer: req.user._id, amount, method: 'card',
        status: 'pending', gatewayOrderId: paymentIntent.id,
        description: `Booking #${booking.bookingNumber}`,
      });

      return res.json({
        success: true, data: { clientSecret: paymentIntent.client_secret, paymentId: payment._id },
      });
    } catch (err) {
      return next(new AppError(`Payment gateway error: ${err.message}`, 502));
    }
  }

  // Cash payment (mark as pending cash)
  if (method === 'cash') {
    const payment = await Payment.create({
      booking: bookingId, customer: req.user._id, amount, method: 'cash', status: 'pending',
      description: `Cash payment for booking #${booking.bookingNumber}`,
    });
    await Booking.findByIdAndUpdate(bookingId, { paymentMethod: 'cash', paymentId: payment._id });
    return res.json({ success: true, message: 'Cash payment registered.', data: { payment } });
  }

  next(new AppError('Unsupported payment method.', 400));
}));

// Confirm card payment (called after Stripe confirms)
router.post('/confirm', asyncHandler(async (req, res, next) => {
  const { paymentIntentId, paymentId } = req.body;
  const payment = await Payment.findById(paymentId).populate('booking');
  if (!payment) return next(new AppError('Payment not found.', 404));

  try {
    const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === 'succeeded') {
      payment.status = 'success';
      payment.gatewayPaymentId = pi.latest_charge;
      await payment.save();
      await Booking.findByIdAndUpdate(payment.booking._id, { paymentStatus: 'paid', paidAmount: payment.amount });

      const io = req.app.get('io');
      await createNotification({
        recipient: req.user._id, type: 'payment_success',
        title: '✅ Payment Successful!', message: `₹${payment.amount} paid successfully.`,
        io,
      });
      return res.json({ success: true, message: 'Payment confirmed.', data: { payment } });
    }
    return next(new AppError('Payment not completed yet.', 400));
  } catch (err) {
    return next(new AppError(`Payment confirmation failed: ${err.message}`, 502));
  }
}));

// Get payment history
router.get('/history', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await Payment.countDocuments({ customer: req.user._id });
  const payments = await Payment.find({ customer: req.user._id })
    .populate('booking', 'bookingNumber service')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { payments, total } });
}));

export default router;
