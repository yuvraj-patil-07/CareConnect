/**
 * Email Service — CareConnect AI
 * Nodemailer with HTML email templates
 */

import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Email Templates ──────────────────────────────────────────────────────────

const templates = {
  welcome: ({ name, verifyURL }) => ({
    subject: 'Welcome to CareConnect AI — Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 32px; text-align: center; }
          .logo { color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .logo span { color: #34d399; }
          .body { padding: 40px 32px; }
          h1 { color: #1e293b; font-size: 24px; margin-bottom: 8px; }
          p { color: #64748b; line-height: 1.7; }
          .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Care<span>Connect</span> AI</div>
          </div>
          <div class="body">
            <h1>Welcome, ${name}! 👋</h1>
            <p>We're thrilled to have you join CareConnect AI — your intelligent home services marketplace.</p>
            <p>Please verify your email address to unlock all features and get started:</p>
            <center><a href="${verifyURL}" class="btn">Verify My Email</a></center>
            <p style="color:#94a3b8; font-size:13px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">© 2026 CareConnect AI. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: ({ name, resetURL, expiresIn }) => ({
    subject: 'CareConnect AI — Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 32px; text-align: center; }
          .logo { color: #fff; font-size: 28px; font-weight: 800; }
          .logo span { color: #34d399; }
          .body { padding: 40px 32px; }
          h1 { color: #1e293b; font-size: 24px; }
          p { color: #64748b; line-height: 1.7; }
          .btn { display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
          .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; color: #92400e; font-size: 14px; margin: 16px 0; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><div class="logo">Care<span>Connect</span> AI</div></div>
          <div class="body">
            <h1>Reset Your Password 🔐</h1>
            <p>Hi ${name}, we received a request to reset your password.</p>
            <center><a href="${resetURL}" class="btn">Reset Password</a></center>
            <div class="warning">⏰ This link expires in <strong>${expiresIn}</strong>. If you didn't request this, please ignore this email and your password will remain unchanged.</div>
          </div>
          <div class="footer">© 2026 CareConnect AI. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordChanged: ({ name }) => ({
    subject: 'CareConnect AI — Password Changed Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); padding: 40px 32px; text-align: center; }
          .logo { color: #fff; font-size: 28px; font-weight: 800; }
          .body { padding: 40px 32px; }
          h1 { color: #1e293b; }
          p { color: #64748b; line-height: 1.7; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><div class="logo">✅ Password Changed</div></div>
          <div class="body">
            <h1>Hi ${name},</h1>
            <p>Your CareConnect AI password has been changed successfully.</p>
            <p>If you didn't make this change, please <a href="${process.env.FRONTEND_URL}/forgot-password">reset your password immediately</a> or contact our support team.</p>
          </div>
          <div class="footer">© 2026 CareConnect AI. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  }),

  bookingConfirmation: ({ customerName, bookingNumber, serviceName, scheduledDate, providerName, amount }) => ({
    subject: `CareConnect AI — Booking Confirmed #${bookingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 32px; text-align: center; color: #fff; }
          .body { padding: 40px 32px; }
          .detail-card { background: #f8fafc; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .label { color: #64748b; font-size: 14px; }
          .value { color: #1e293b; font-weight: 600; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;font-size:24px;">Booking Confirmed!</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${customerName}</strong>, your booking has been confirmed.</p>
            <div class="detail-card">
              <div class="detail-row"><span class="label">Booking ID</span><span class="value">#${bookingNumber}</span></div>
              <div class="detail-row"><span class="label">Service</span><span class="value">${serviceName}</span></div>
              <div class="detail-row"><span class="label">Provider</span><span class="value">${providerName}</span></div>
              <div class="detail-row"><span class="label">Scheduled</span><span class="value">${scheduledDate}</span></div>
              <div class="detail-row"><span class="label">Amount</span><span class="value">₹${amount}</span></div>
            </div>
          </div>
          <div class="footer">© 2026 CareConnect AI. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Send email using a named template or custom content
 */
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    let emailContent;

    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else {
      emailContent = { subject, html, text };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'CareConnect AI'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html || html,
      text: emailContent.text || text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err.message);
    throw err;
  }
};

/**
 * Verify SMTP connection (call on startup)
 */
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info('✅ Email service (SMTP) ready');
  } catch (err) {
    logger.warn('⚠️ Email service unavailable:', err.message);
  }
};
