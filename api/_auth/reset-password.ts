import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'reset-pwd' })) {
    return;
  }

  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const cleanToken = String(token).trim();

    const user = await (prisma as any).user.findFirst({
      where: {
        resetToken: cleanToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset link.' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);

    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error while resetting password.' });
  }
}
