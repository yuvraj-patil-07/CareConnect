/**
 * Chat, Notification, Dispute, Quote, Wallet, Payment, Admin, Analytics,
 * Subscription, Coupon, Upload Routes — CareConnect AI
 */

// ── chat.routes.js ─────────────────────────────────────────────────────────────
import express from 'express';
const chatRouter = express.Router();
import { protect } from '../middlewares/auth.middleware.js';
import { Chat, Message } from '../models/Chat.model.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { uploadChatMedia } from '../middlewares/upload.middleware.js';

chatRouter.use(protect);

chatRouter.get('/', asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id, isActive: true })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .populate('booking', 'bookingNumber status')
    .sort('-lastMessageAt');
  res.json({ success: true, data: { chats } });
}));

chatRouter.post('/', asyncHandler(async (req, res) => {
  const { participantId, bookingId } = req.body;
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(bookingId ? { booking: bookingId } : {}),
  });
  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      booking: bookingId || null,
    });
  }
  await chat.populate('participants', 'name avatar role');
  res.json({ success: true, data: { chat } });
}));

chatRouter.get('/:chatId/messages', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !chat.participants.includes(req.user._id.toString())) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const total = await Message.countDocuments({ chat: req.params.chatId, isDeleted: false });
  const messages = await Message.find({ chat: req.params.chatId, isDeleted: false })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(+limit);
  res.json({ success: true, data: { messages: messages.reverse(), total } });
}));

chatRouter.post('/:chatId/messages', asyncHandler(async (req, res) => {
  const { content, messageType, replyTo } = req.body;
  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user._id,
    content,
    messageType: messageType || 'text',
    replyTo,
  });
  await Chat.findByIdAndUpdate(req.params.chatId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
    lastMessageContent: content?.substring(0, 100),
    lastMessageSender: req.user._id,
    $inc: { [`unreadCount.${req.params.chatId}`]: 1 },
  });
  await message.populate('sender', 'name avatar');
  // Emit via socket
  const io = req.app.get('io');
  if (io) io.to(`chat:${req.params.chatId}`).emit('chat:message', message);
  res.status(201).json({ success: true, data: { message } });
}));

chatRouter.post('/:chatId/media', uploadChatMedia, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required.' });
  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user._id,
    messageType: req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : req.file.mimetype.startsWith('audio') ? 'audio' : 'document',
    mediaUrl: req.file.path,
    mediaPublicId: req.file.filename,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    content: req.body.caption || '',
  });
  const io = req.app.get('io');
  if (io) io.to(`chat:${req.params.chatId}`).emit('chat:message', message);
  res.status(201).json({ success: true, data: { message } });
}));

export default chatRouter;
