import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken, getJwtSecret, checkAdmin } from '../_lib/auth-util.js';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractToken(req);
  let userId: string | null = null;
  let userEmail: string | null = null;

  if (token) {
    try {
      const jwtSecret = getJwtSecret();
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as { userId: string; email?: string };
      userId = decoded.userId;
      userEmail = decoded.email || null;
    } catch {
      // Invalid or expired token
    }
  }

  const { isAdmin } = await checkAdmin(req);

  const { orderNumber, email, trackingNumber, all } = req.query as {
    orderNumber?: string;
    email?: string;
    trackingNumber?: string;
    all?: string;
  };

  try {
    // 1. Full database dump request (Admin only!)
    if (all === 'true') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden. Administrative privileges required to list all orders.' });
      }

      const orders = await (prisma as any).order.findMany({
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ orders, total: orders.length });
    }

    // 2. Search by Tracking Number (Requires matching email for non-admins to prevent enumeration)
    if (trackingNumber && trackingNumber.trim()) {
      const cleanTracking = trackingNumber.trim();
      const cleanEmail = email ? email.trim().toLowerCase() : (userEmail ? userEmail.toLowerCase() : null);

      if (!isAdmin && !cleanEmail) {
        return res.status(400).json({ 
          message: 'Customer email address is required alongside tracking number to verify identity.' 
        });
      }

      const whereClause: any = {
        trackingNumber: { equals: cleanTracking, mode: 'insensitive' },
      };

      if (!isAdmin && cleanEmail) {
        whereClause.customerEmail = { equals: cleanEmail, mode: 'insensitive' };
      }

      const order = await (prisma as any).order.findFirst({
        where: whereClause,
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({ message: 'No shipment found matching provided tracking details.' });
      }

      return res.status(200).json({ order });
    }

    // 3. Search by Order Number (Requires matching email for non-admins)
    if (orderNumber && orderNumber.trim()) {
      const cleanOrderNumber = orderNumber.trim();
      const cleanEmail = email ? email.trim().toLowerCase() : (userEmail ? userEmail.toLowerCase() : null);

      if (!isAdmin && !cleanEmail) {
        return res.status(400).json({ 
          message: 'Customer email address is required alongside order number to verify order ownership.' 
        });
      }

      const whereClause: any = {
        orderNumber: { equals: cleanOrderNumber, mode: 'insensitive' },
      };

      if (!isAdmin && cleanEmail) {
        whereClause.customerEmail = { equals: cleanEmail, mode: 'insensitive' };
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

    // 4. Default: If Admin, return all orders
    if (isAdmin) {
      const orders = await (prisma as any).order.findMany({
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ orders, total: orders.length });
    }

    // 5. Authenticated User: Return only their personal orders
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please sign in to view your orders.' });
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

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Order List Error:', error);
    return res.status(500).json({ message: 'Internal server error while retrieving orders.' });
  }
}
