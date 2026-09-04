import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken, getJwtSecret } from '../_lib/auth-util.js';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please sign in.' });
    }

    const jwtSecret = getJwtSecret();
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as { userId: string };
    } catch {
      return res.status(401).json({ message: 'Session expired or invalid.' });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // Safety: Master administrator cannot be deleted via the customer endpoint
    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Administrative accounts cannot be deleted via this endpoint.' });
    }

    const { password, confirm } = req.body || {};

    // Require password confirmation if account has a standard password
    if (password) {
      const isMatch = await bcrypt.compare(String(password), user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password provided.' });
      }
    } else if (confirm !== true) {
      return res.status(400).json({ message: 'Password or explicit confirmation is required to delete your account.' });
    }

    await (prisma as any).user.delete({
      where: { id: user.id },
    });

    // Clear auth cookie
    res.setHeader(
      'Set-Cookie',
      serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
      })
    );

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ message: 'Internal server error while processing account deletion.' });
  }
}
