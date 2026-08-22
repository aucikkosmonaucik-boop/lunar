import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { sendEmail } from '../_lib/email.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    if (user.verificationToken === null) {
      return res.status(200).json({
        message: 'This email address is already verified. You can sign in.',
        alreadyVerified: true,
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Send verification email via Resend
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Account — Lunar',
      templateName: 'verify-account',
      data: {
        VERIFICATION_URL: verificationUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'A new verification link has been sent to your email address.',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Failed to resend verification email. Please try again later.' });
  }
}
