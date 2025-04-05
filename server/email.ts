import { User } from '@shared/schema';
import crypto from 'crypto';
import { storage } from './storage';
import * as nodemailer from 'nodemailer';

// Check for email credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.warn("Email credentials (EMAIL_USER, EMAIL_APP_PASSWORD) are not set. Email services will not work properly.");
}

// Base URL for application (should come from environment variable in production)
const BASE_URL = process.env.BASE_URL || (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : 'http://localhost:5000');
const FROM_EMAIL = process.env.EMAIL_FROM || 'hello@myadventurousplanningally.com';
const FROM_NAME = process.env.FROM_NAME || 'MAPA AI';

// Create Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Generic email sending function
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('Email credentials not set, cannot send email');
    return false;
  }

  try {
    // Send mail with Nodemailer
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text
    });
    
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Handle password reset request
export async function sendPasswordResetEmail(user: User): Promise<boolean> {
  // Generate reset token and set expiry (24 hours from now)
  const resetToken = generateToken();
  const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update user with reset token and expiry
  try {
    await storage.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    // Create reset URL
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

    // Send email
    return await sendEmail({
      to: user.email,
      subject: 'Reset Your MAPA AI Password',
      text: `Hello ${user.fullName || user.username},\n\nYou requested a password reset for your MAPA AI account. Please click the link below to reset your password. This link will expire in 24 hours.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe MAPA AI Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E88E5;">Reset Your MAPA AI Password</h2>
          <p>Hello ${user.fullName || user.username},</p>
          <p>You requested a password reset for your MAPA AI account. Please click the link below to reset your password. This link will expire in 24 hours.</p>
          <p><a href="${resetUrl}" style="display: inline-block; background-color: #1E88E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br/>The MAPA AI Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Handle email verification
export async function sendVerificationEmail(user: User): Promise<boolean> {
  // Generate verification token and set expiry (48 hours from now)
  const verificationToken = generateToken();
  const verificationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Update user with verification token and expiry
  try {
    await storage.updateUser(user.id, {
      verificationToken,
      verificationTokenExpires: verificationExpires
    });

    // Create verification URL
    const verifyUrl = `${BASE_URL}/verify-email?token=${verificationToken}`;

    // Send email
    return await sendEmail({
      to: user.email,
      subject: 'Verify Your MAPA AI Email Address',
      text: `Hello ${user.fullName || user.username},\n\nThank you for registering with MAPA AI. Please click the link below to verify your email address. This link will expire in 48 hours.\n\n${verifyUrl}\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nThe MAPA AI Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E88E5;">Verify Your MAPA AI Email Address</h2>
          <p>Hello ${user.fullName || user.username},</p>
          <p>Thank you for registering with MAPA AI. Please click the link below to verify your email address. This link will expire in 48 hours.</p>
          <p><a href="${verifyUrl}" style="display: inline-block; background-color: #1E88E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verifyUrl}</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Best regards,<br/>The MAPA AI Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Send a welcome email after verification
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  return await sendEmail({
    to: user.email,
    subject: 'Welcome to MAPA AI!',
    text: `Hello ${user.fullName || user.username},\n\nThank you for verifying your email address. Your MAPA AI account is now fully activated!\n\nStart planning your Filipino travel adventures today.\n\nBest regards,\nThe MAPA AI Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E88E5;">Welcome to MAPA AI!</h2>
        <p>Hello ${user.fullName || user.username},</p>
        <p>Thank you for verifying your email address. Your MAPA AI account is now fully activated!</p>
        <p>Start planning your Filipino travel adventures today.</p>
        <p><a href="${BASE_URL}/dashboard" style="display: inline-block; background-color: #1E88E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
        <p>Best regards,<br/>The MAPA AI Team</p>
      </div>
    `
  });
}