/**
 * Database Configuration
 * MongoDB connection with retry logic and connection pooling
 */

import mongoose from 'mongoose';
import { logger } from './logger.js';

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

let retryCount = 0;
const MAX_RETRIES = 5;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/careconnect',
      MONGO_OPTIONS
    );

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(connectDB, 5000 * retryCount);
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
      retryCount = 0;
    });

  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`Retrying connection... Attempt ${retryCount}/${MAX_RETRIES}`);
      setTimeout(connectDB, 5000 * retryCount);
    } else {
      logger.error('Max retries reached. Exiting...');
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected.');
};
