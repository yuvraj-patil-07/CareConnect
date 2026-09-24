/**
 * Winston Logger Configuration
 * Structured logging for production with multiple transports
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { combine, timestamp, printf, colorize, align, json } = winston.format;

// Custom log format for console
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// JSON format for file logs
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'careconnect-api' },
  transports: [
    // Console output (all environments)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Add HTTP transport level for morgan
logger.http = (message) => logger.log('http', message);

// Don't log to files in test environment
if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach((t) => {
    if (t instanceof winston.transports.File) t.silent = true;
  });
}
