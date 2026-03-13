import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      orders,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Order List Error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ 
      message: 'Internal server error',
      error: err.message
    });
  }
}
