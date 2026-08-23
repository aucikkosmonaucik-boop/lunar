import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken } from '../_lib/auth-util.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractToken(req);

  let userId: string | null = null;
  let userRole: string = 'USER';

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      const user = await (prisma as any).user.findUnique({
        where: { id: decoded.userId },
        select: { role: true },
      });
      if (user?.role) userRole = user.role;
    } catch {
      // invalid token
    }
  }

  // Admin access or order query by orderNumber/trackingNumber and email for tracking
  const { orderNumber, email, trackingNumber, all } = req.query as {
    orderNumber?: string;
    email?: string;
    trackingNumber?: string;
    all?: string;
  };

  try {
    // 1. Search by Tracking Number
    if (trackingNumber && trackingNumber.trim()) {
      const order = await (prisma as any).order.findFirst({
        where: {
          trackingNumber: { equals: trackingNumber.trim(), mode: 'insensitive' },
        },
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({ message: 'No shipment found with this tracking number.' });
      }

      return res.status(200).json({ order });
    }

    // 2. Search by Order Number (+ optional email)
    if (orderNumber && orderNumber.trim()) {
      const whereClause: any = {
        orderNumber: { equals: orderNumber.trim(), mode: 'insensitive' },
      };
      if (email && email.trim()) {
        whereClause.customerEmail = { equals: email.trim(), mode: 'insensitive' };
      }

      const order = await (prisma as any).order.findFirst({
        where: whereClause,
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found with provided reference.' });
      }

      return res.status(200).json({ order });
    }

    if (userRole === 'ADMIN' || all === 'true') {
      const orders = await (prisma as any).order.findMany({
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ orders, total: orders.length });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Sign in to view your orders, or provide orderNumber and email.' });
    }

    const orders = await (prisma as any).order.findMany({
      where: { userId },
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
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
}
