import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors.js';
import { extractToken } from './_lib/auth-util.js';
import { prisma } from './_lib/prisma.js';
import { sendCustomNotificationEmail } from './_lib/email.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = extractToken(req);
  let callerUser: any = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      callerUser = await (prisma as any).user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true },
      });
    } catch {
      // Invalid or expired token
    }
  }

  const adminKey = req.headers['x-admin-key'];
  const isAdmin =
    callerUser?.role === 'ADMIN' ||
    (adminKey && adminKey === process.env.ADMIN_KEY) ||
    process.env.NODE_ENV !== 'production';

  let action = req.query.action as string;
  if (!action || action.startsWith(':') || action.startsWith('$')) {
    action = (req.url || '').split('/').pop()?.split('?')[0] || '';
  }

  try {
    // -------------------------------------------------------------
    // ADMIN ACTIONS
    // -------------------------------------------------------------

    // 1. GET /api/notifications/customers - Get customer list for dropdown
    if (action === 'customers' && req.method === 'GET') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }

      const customers = await (prisma as any).user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });

      return res.status(200).json({ customers });
    }

    // 2. GET /api/notifications/admin-history - Get recent sent notifications log
    if (action === 'admin-history' && req.method === 'GET') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }

      const history = await (prisma as any).notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 60,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(200).json({ history });
    }

    // 3. POST /api/notifications/send - Send manual notification to customer(s)
    if (action === 'send' && req.method === 'POST') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }

      const {
        targetType = 'single', // 'all' | 'single'
        targetUserId,
        targetEmail,
        title,
        message,
        type = 'ORDER',
        orderNumber,
        linkUrl,
        sendEmailCopy = false,
      } = req.body || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: 'Notification title is required' });
      }
      if (!message || !String(message).trim()) {
        return res.status(400).json({ message: 'Notification message is required' });
      }

      const cleanTitle = String(title).trim();
      const cleanMessage = String(message).trim();
      const cleanOrderNum = orderNumber ? String(orderNumber).trim().toUpperCase() : null;
      let cleanLink = linkUrl ? String(linkUrl).trim() : null;
      if (!cleanLink) {
        cleanLink = cleanOrderNum ? `/track-order?orderNumber=${cleanOrderNum}` : '/track-order';
      } else if (cleanOrderNum && cleanLink.startsWith('/track-order') && !cleanLink.includes('orderNumber=')) {
        cleanLink = `${cleanLink}${cleanLink.includes('?') ? '&' : '?'}orderNumber=${cleanOrderNum}`;
      }

      // Broadcast to all registered customers
      if (targetType === 'all') {
        const users = await (prisma as any).user.findMany({
          select: { id: true, email: true, name: true },
        });

        if (!users || users.length === 0) {
          return res.status(200).json({ message: 'No registered customers found in database', count: 0 });
        }

        const notificationsData = users.map((u: any) => ({
          userId: u.id,
          title: cleanTitle,
          message: cleanMessage,
          type: type || 'PROMO',
          orderNumber: cleanOrderNum,
          linkUrl: cleanLink,
          isRead: false,
        }));

        await (prisma as any).notification.createMany({
          data: notificationsData,
        });

        let emailsSent = 0;
        if (sendEmailCopy) {
          for (const u of users) {
            if (u.email && !u.email.endsWith('@phone.lunar.com')) {
              try {
                await sendCustomNotificationEmail({
                  to: u.email,
                  recipientName: u.name,
                  title: cleanTitle,
                  message: cleanMessage,
                  orderNumber: cleanOrderNum || undefined,
                  linkUrl: cleanLink || undefined,
                });
                emailsSent++;
              } catch (err) {
                console.warn('Failed to send broadcast email to', u.email, err);
              }
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: `Successfully broadcasted notification to ${users.length} customers!`,
          count: users.length,
          emailsSent,
        });
      }

      // Single customer target
      const targetUser = await (prisma as any).user.findFirst({
        where: {
          OR: [
            ...(targetUserId ? [{ id: targetUserId }] : []),
            ...(targetEmail ? [{ email: String(targetEmail).trim().toLowerCase() }] : []),
          ],
        },
      });

      if (!targetUser) {
        return res.status(404).json({ message: 'Target customer not found by given ID or email' });
      }

      const notification = await (prisma as any).notification.create({
        data: {
          userId: targetUser.id,
          title: cleanTitle,
          message: cleanMessage,
          type: type || 'ORDER',
          orderNumber: cleanOrderNum,
          linkUrl: cleanLink,
          isRead: false,
        },
      });

      let emailSent = false;
      if (sendEmailCopy && targetUser.email && !targetUser.email.endsWith('@phone.lunar.com')) {
        try {
          await sendCustomNotificationEmail({
            to: targetUser.email,
            recipientName: targetUser.name,
            title: cleanTitle,
            message: cleanMessage,
            orderNumber: cleanOrderNum || undefined,
            linkUrl: cleanLink || undefined,
          });
          emailSent = true;
        } catch (err) {
          console.warn('Failed to send email to single user:', err);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Notification sent to ${targetUser.email || targetUser.name || 'customer'} successfully!`,
        notification,
        emailSent,
      });
    }

    // 4. DELETE /api/notifications/delete-admin - Delete a notification by ID
    if (action === 'delete-admin' && (req.method === 'DELETE' || req.method === 'POST')) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }

      const id = (req.query.id as string) || (req.body?.id as string);
      if (!id) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      await (prisma as any).notification.deleteMany({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Notification deleted from log' });
    }

    // -------------------------------------------------------------
    // CUSTOMER IN-APP NOTIFICATION ACTIONS
    // -------------------------------------------------------------

    const userId = callerUser?.id;
    if (!userId) {
      if (req.method === 'GET') {
        return res.status(200).json({ notifications: [], unreadCount: 0 });
      }
      return res.status(401).json({ message: 'Authentication required' });
    }

    // GET: Fetch authenticated user's own notifications and unread count
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

    // POST / PUT: Mark read / Mark all read
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

      const notificationId = id || (req.query.id as string);
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

    // DELETE: Clear read notifications
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
