/**
 * Chat & Message Models — CareConnect AI
 * Real-time chat with Socket.io
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'system'],
    default: 'text',
  },
  content: { type: String, maxlength: 5000 },
  mediaUrl: String,
  mediaPublicId: String,
  mediaThumbnail: String,
  fileName: String,
  fileSize: Number,
  location: { latitude: Number, longitude: Number, address: String },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
  }],
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  chatType: { type: String, enum: ['booking', 'support', 'group'], default: 'booking' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: Date,
  lastMessageContent: String,
  lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unreadCount: { type: Map, of: Number, default: {} },
  isActive: { type: Boolean, default: true },
  isMuted: { type: Map, of: Boolean, default: {} },
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: String },
}, { timestamps: true, toJSON: { virtuals: true } });

chatSchema.index({ participants: 1 });
chatSchema.index({ booking: 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
export const Chat = mongoose.model('Chat', chatSchema);
