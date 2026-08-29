import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken } from '../_lib/auth-util.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(200).json({ user: null, authenticated: false });
    }

    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return res.status(200).json({ user: null, authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        street: true,
        city: true,
        postalCode: true,
        country: true,
        phone: true,
        role: true,
        loyaltyPoints: true,
      } as any,
    });

    if (!user) {
      return res.status(200).json({ user: null, authenticated: false });
    }

    return res.status(200).json({ user, authenticated: true });
  } catch (error) {
    const err = error as Error;
    console.error('Verification error:', err);
    res.status(500).json({ message: `Prisma/Vercel Error: ${err.message}`, stack: err.stack });
  }
}
