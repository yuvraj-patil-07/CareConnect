/**
 * Notification Service — CareConnect AI
 * Creates DB notifications + emits via Socket.io
 */

import Notification from '../models/Notification.model.js';
import { logger } from '../config/logger.js';

/**
 * Create a notification and emit via socket if io is provided
 */
export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  data = {},
  image = null,
  deepLink = null,
  actionUrl = null,
  priority = 'normal',
  channel = ['in_app'],
  io = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      data,
      image,
      deepLink,
      actionUrl,
      priority,
      channel,
    });

    // Emit real-time notification via Socket.io
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', {
        _id: notification._id,
        type,
        title,
        message,
        data,
        priority,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    logger.error('Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Create bulk notifications for multiple recipients
 */
export const createBulkNotifications = async (notifications, io = null) => {
  try {
    const created = await Notification.insertMany(notifications);
    if (io) {
      created.forEach((n) => {
        io.to(`user:${n.recipient.toString()}`).emit('notification:new', n);
      });
    }
    return created;
  } catch (err) {
    logger.error('Failed to create bulk notifications:', err.message);
    return [];
  }
};

/**
 * Mark notifications as read
 */
export const markNotificationsRead = async (userId, notificationIds = null) => {
  const filter = { recipient: userId };
  if (notificationIds?.length) {
    filter._id = { $in: notificationIds };
  }
  return Notification.updateMany(filter, { isRead: true, readAt: new Date() });
};

/**
 * Get unread count for a user
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

// ─── Booking Notification Helpers ─────────────────────────────────────────────

export const notifyBookingCreated = async (booking, io = null) => {
  await createNotification({
    recipient: booking.customer,
    type: 'booking_created',
    title: 'Booking Submitted! 📋',
    message: `Your booking #${booking.bookingNumber} has been submitted. Providers will send quotes shortly.`,
    data: { bookingId: booking._id, bookingNumber: booking.bookingNumber },
    deepLink: `/bookings/${booking._id}`,
    io,
  });
};

export const notifyBookingAccepted = async (booking, providerName, io = null) => {
  await createNotification({
    recipient: booking.customer,
    type: 'booking_accepted',
    title: 'Quote Accepted! ✅',
    message: `${providerName} has been confirmed for booking #${booking.bookingNumber}.`,
    data: { bookingId: booking._id },
    deepLink: `/bookings/${booking._id}`,
    priority: 'high',
    io,
  });
};

export const notifyProviderEnroute = async (customerId, bookingId, eta, io = null) => {
  await createNotification({
    recipient: customerId,
    type: 'provider_enroute',
    title: 'Provider On The Way! 🚗',
    message: `Your service provider is on the way. ETA: ${eta} minutes.`,
    data: { bookingId, eta },
    deepLink: `/bookings/${bookingId}/track`,
    priority: 'high',
    io,
  });
};

export const notifyPaymentSuccess = async (userId, amount, bookingNumber, io = null) => {
  await createNotification({
    recipient: userId,
    type: 'payment_success',
    title: 'Payment Successful! 💰',
    message: `₹${amount} paid successfully for booking #${bookingNumber}.`,
    data: { amount, bookingNumber },
    io,
  });
};
