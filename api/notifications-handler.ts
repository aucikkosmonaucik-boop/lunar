import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors.js';
import { extractToken } from './_lib/auth-util.js';
import { prisma } from './_lib/prisma.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }

  let action = req.query.action as string;
  if (!action || action.startsWith(':') || action.startsWith('$')) {
    action = (req.url || '').split('/').pop()?.split('?')[0] || '';
  }

  try {
    // 1. GET: Fetch list of notifications and unread count
    if (req.method === 'GET') {
      const notifications = await (prisma as any).notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await (prisma as any).notification.count({
        where: { userId, isRead: false },
      });

      return res.status(200).json({
        notifications,
        unreadCount,
      });
    }

    // 2. POST / PUT: Mark read / Mark all read
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      const { id, all } = req.body || {};

      if (action === 'mark-all-read' || all === true) {
        await (prisma as any).notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });

        return res.status(200).json({
          message: 'All notifications marked as read',
          unreadCount: 0,
        });
      }

      const notificationId = id || req.query.id as string;
      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      const updated = await (prisma as any).notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });

      const unreadCount = await (prisma as any).notification.count({
        where: { userId, isRead: false },
      });

      return res.status(200).json({
        message: 'Notification marked as read',
        count: updated.count,
        unreadCount,
      });
    }

    // 3. DELETE: Clear read notifications
    if (req.method === 'DELETE') {
      const notificationId = (req.query.id as string) || (req.body?.id as string);

      if (notificationId) {
        await (prisma as any).notification.deleteMany({
          where: { id: notificationId, userId },
        });
      } else {
        await (prisma as any).notification.deleteMany({
          where: { userId, isRead: true },
        });
      }

      return res.status(200).json({ message: 'Notifications cleared successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications Handler Error:', error);
    return res.status(500).json({
      message: 'Internal server error in Notifications Handler',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
