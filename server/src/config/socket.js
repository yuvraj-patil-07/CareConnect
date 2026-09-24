/**
 * Socket.io Configuration
 * Real-time bidirectional event-based communication
 * Handles: Chat, Live Tracking, Notifications, Booking Updates
 */

import jwt from 'jsonwebtoken';
import { logger } from './logger.js';
import User from '../models/User.model.js';

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

export const initializeSocket = (io) => {
  // ─── Authentication Middleware ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name role avatar isActive');

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      logger.error('Socket auth error:', err.message);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: ${userId} (${socket.id})`);

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Emit online status to friends/connections
    socket.broadcast.emit('user:online', { userId });

    // ─── Chat Events ─────────────────────────────────────────────────────────
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${userId} joined chat: ${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('chat:typing', ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', {
        userId,
        chatId,
        isTyping,
      });
    });

    socket.on('chat:message', async (data) => {
      // Message is saved via REST API; here we broadcast in real-time
      io.to(`chat:${data.chatId}`).emit('chat:message', {
        ...data,
        senderId: userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('chat:read', ({ chatId, messageIds }) => {
      socket.to(`chat:${chatId}`).emit('chat:read', {
        userId,
        chatId,
        messageIds,
        readAt: new Date().toISOString(),
      });
    });

    // ─── Booking Events ───────────────────────────────────────────────────────
    socket.on('booking:join', (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('booking:status_update', (data) => {
      io.to(`booking:${data.bookingId}`).emit('booking:status_update', data);
    });

    // ─── Live Tracking Events ─────────────────────────────────────────────────
    socket.on('tracking:update_location', ({ bookingId, latitude, longitude, heading, speed }) => {
      socket.to(`booking:${bookingId}`).emit('tracking:location', {
        providerId: userId,
        bookingId,
        latitude,
        longitude,
        heading,
        speed,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('tracking:start', ({ bookingId }) => {
      io.to(`booking:${bookingId}`).emit('tracking:started', {
        providerId: userId,
        bookingId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('tracking:stop', ({ bookingId }) => {
      io.to(`booking:${bookingId}`).emit('tracking:stopped', {
        providerId: userId,
        bookingId,
      });
    });

    // ─── Notification Events ──────────────────────────────────────────────────
    socket.on('notification:read', (notificationId) => {
      socket.emit('notification:read_ack', { notificationId });
    });

    // ─── Quote Events ─────────────────────────────────────────────────────────
    socket.on('quote:new', (data) => {
      io.to(`user:${data.customerId}`).emit('quote:received', data);
    });

    socket.on('quote:accepted', (data) => {
      io.to(`user:${data.providerId}`).emit('quote:accepted', data);
    });

    socket.on('quote:rejected', (data) => {
      io.to(`user:${data.providerId}`).emit('quote:rejected', data);
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', {
            userId,
            lastSeen: new Date().toISOString(),
          });
        }
      }
      logger.info(`Socket disconnected: ${userId} (${reason})`);
    });
  });

  logger.info('✅ Socket.io initialized');
};

/**
 * Send notification to specific user via socket
 */
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString()) && onlineUsers.get(userId.toString()).size > 0;
};

/**
 * Get all online user IDs
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
