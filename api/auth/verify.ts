import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

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
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    const err = error as Error;
    console.error('Verification error:', err);
    res.status(500).json({ message: `Prisma/Vercel Error: ${err.message}`, stack: err.stack });
  }
}
