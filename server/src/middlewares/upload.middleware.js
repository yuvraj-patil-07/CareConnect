/**
 * Upload Middleware — CareConnect AI
 * Multer + Cloudinary file upload
 */

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from './errorHandler.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// ─── Storage Engines ──────────────────────────────────────────────────────────

const createStorage = (folder, allowedFormats, resourceType = 'image') =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `careconnect/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [{ width: 1200, quality: 'auto', fetch_format: 'auto' }] : undefined,
      public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }),
  });

const avatarStorage = createStorage('avatars', ['jpg', 'jpeg', 'png', 'webp']);
const portfolioStorage = createStorage('portfolio', ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'], 'auto');
const documentStorage = createStorage('documents', ['jpg', 'jpeg', 'png', 'pdf']);
const bookingStorage = createStorage('bookings', ['jpg', 'jpeg', 'png', 'webp', 'mp4'], 'auto');
const chatStorage = createStorage('chat', ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4', 'mp3'], 'auto');
const categoryStorage = createStorage('categories', ['jpg', 'jpeg', 'png', 'webp', 'svg']);

// ─── File Filter ──────────────────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed.', 400), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only images and PDF files are allowed for documents.', 400), false);
  }
};

const mediaFilter = (req, file, cb) => {
  const allowed = ['image/', 'video/', 'audio/'];
  if (allowed.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new AppError('Only image, video, or audio files are allowed.', 400), false);
  }
};

// ─── Multer Instances ────────────────────────────────────────────────────────

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

export const uploadPortfolio = multer({
  storage: portfolioStorage,
  fileFilter: mediaFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).array('portfolio', 10);

export const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('document');

export const uploadBookingMedia = multer({
  storage: bookingStorage,
  fileFilter: mediaFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).array('media', 10);

export const uploadChatMedia = multer({
  storage: chatStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'video/', 'audio/', 'application/pdf'];
    if (allowed.some((type) => file.mimetype.startsWith(type) || file.mimetype === type)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file type.', 400), false);
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 },
}).single('file');

export const uploadCategoryImage = multer({
  storage: categoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err.message);
  }
};
