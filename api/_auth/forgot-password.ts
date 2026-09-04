import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { sendEmail } from '../_lib/email.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate Limiting: max 5 requests per 15 min per IP
  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'forgot-pwd' })) {
    return;
  }

  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await (prisma as any).user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // For security, don't reveal if user exists (User Enumeration Prevention)
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await (prisma as any).user.update({
      where: { email: cleanEmail },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: cleanEmail,
      subject: 'Reset Your Password — Lunar',
      templateName: 'reset-password',
      data: {
        RESET_URL: resetUrl,
      },
    });

    return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
