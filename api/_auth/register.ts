import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { sendEmail } from '../_lib/email.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 5 registration attempts per hour per IP
  if (applyRateLimit(req, res, { windowMs: 60 * 60 * 1000, max: 5, keyPrefix: 'register' })) {
    return;
  }

  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const cleanPassword = String(password);
    if (cleanPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (cleanPassword.length > 128) {
      return res.status(400).json({ message: 'Password cannot exceed 128 characters.' });
    }

    const cleanName = name ? String(name).trim().slice(0, 100) : null;

    const existingUser = await (prisma as any).user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await (prisma as any).user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: cleanName,
        role: 'USER', // Always enforce USER role
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Send verification email
    try {
      const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: cleanEmail,
        subject: 'Verify Your Account — Lunar',
        templateName: 'verify-account',
        data: {
          VERIFICATION_URL: verificationUrl,
        },
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return res.status(201).json({
      message: 'Account created successfully. We have sent a verification link to your email address. Please confirm your email before signing in.',
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Could not complete registration. Please try again later.' });
  }
}
