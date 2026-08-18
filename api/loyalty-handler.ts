import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// Helper to get authenticated user ID from cookies or Authorization header
function getAuthUserId(req: VercelRequest): string | null {
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

// Default initial loyalty rewards if none exist in DB
const DEFAULT_REWARDS = [
  {
    title: 'Kupon rabatowy 10 PLN / 2.50€',
    description: 'Zniżka na dowolne zamówienie biżuterii lub perfum.',
    pointsCost: 100,
    discountType: 'FIXED',
    discountValue: 2.5,
    minOrderValue: 20,
    isActive: true,
  },
  {
    title: 'Zniżka 10% na całe zakupy',
    description: '10% rabatu na cały koszyk bez limitu wartości.',
    pointsCost: 200,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 30,
    isActive: true,
  },
  {
    title: 'Kupon VIP 25 PLN / 6.00€',
    description: 'Ekskluzywny rabat dla stałych klientów.',
    pointsCost: 350,
    discountType: 'FIXED',
    discountValue: 6.0,
    minOrderValue: 40,
    isActive: true,
  },
  {
    title: 'Złoty Kupon 20% Zniżki',
    description: 'Maksymalny rabat 20% na całą kolekcję Lunar.',
    pointsCost: 500,
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 50,
    isActive: true,
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let action = (req.query.action as string) || '';
  if (!action || action.startsWith(':') || action.startsWith('$')) {
    action = (req.url || '').split('/').pop()?.split('?')[0] || '';
  }

  try {
    // 1. GET REWARDS CATALOG
    if (req.method === 'GET' && (action === 'rewards' || !action)) {
      try {
        let rewards = await (prisma as any).loyaltyReward.findMany({
          orderBy: { pointsCost: 'asc' },
        });

        // Seed default rewards if empty
        if (rewards.length === 0) {
          for (const item of DEFAULT_REWARDS) {
            await (prisma as any).loyaltyReward.create({ data: item });
          }
          rewards = await (prisma as any).loyaltyReward.findMany({
            orderBy: { pointsCost: 'asc' },
          });
        }

        return res.status(200).json({ rewards });
      } catch (error: unknown) {
        // Fallback for offline / dev
        return res.status(200).json({
          rewards: DEFAULT_REWARDS.map((r, i) => ({
            id: `seed-reward-${i + 1}`,
            ...r,
            createdAt: new Date().toISOString(),
          })),
        });
      }
    }

    // 2. GET USER LOYALTY PROFILE (Points, coupons, history)
    if (req.method === 'GET' && action === 'user') {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          loyaltyPoints: true,
          role: true,
          userCoupons: {
            orderBy: { createdAt: 'desc' },
          },
          pointsHistory: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        loyaltyPoints: user.loyaltyPoints || 0,
        coupons: user.userCoupons || [],
        history: user.pointsHistory || [],
      });
    }

    // 3. POST REDEEM POINTS FOR A COUPON
    if (req.method === 'POST' && action === 'redeem') {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'Musisz być zalogowany, aby wymienić punkty' });
      }

      const { rewardId } = req.body || {};
      if (!rewardId) {
        return res.status(400).json({ message: 'Reward ID is required' });
      }

      const [user, reward] = await Promise.all([
        (prisma as any).user.findUnique({ where: { id: userId } }),
        (prisma as any).loyaltyReward.findUnique({ where: { id: rewardId } }),
      ]);

      if (!user) return res.status(404).json({ message: 'Użytkownik nie istnieje' });
      if (!reward || !reward.isActive) return res.status(404).json({ message: 'Nagroda jest niedostępna' });

      if ((user.loyaltyPoints || 0) < reward.pointsCost) {
        return res.status(400).json({
          message: `Niewystarczająca liczba punktów. Masz ${user.loyaltyPoints || 0} pkt, a wymagane jest ${reward.pointsCost} pkt.`,
        });
      }

      // Generate unique coupon code
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `LUNAR-${reward.discountType === 'PERCENTAGE' ? `${reward.discountValue}PCT` : `${reward.discountValue}EUR`}-${randomSuffix}`;

      // Calculate expiration (e.g. 90 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // Perform transaction: deduct points, create coupon, record history
      const [updatedUser, coupon] = await (prisma as any).$transaction([
        (prisma as any).user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: { decrement: reward.pointsCost },
          },
        }),
        (prisma as any).userCoupon.create({
          data: {
            userId,
            rewardId: reward.id,
            code,
            discountType: reward.discountType,
            discountValue: reward.discountValue,
            minOrderValue: reward.minOrderValue,
            isUsed: false,
            expiresAt,
          },
        }),
        (prisma as any).loyaltyHistory.create({
          data: {
            userId,
            points: -reward.pointsCost,
            type: 'REDEEM',
            description: `Wymiana punktów na: ${reward.title} (Kod: ${code})`,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Kupon został pomyślnie wygenerowany!',
        coupon,
        remainingPoints: updatedUser.loyaltyPoints,
      });
    }

    // 4. ADMIN: MANAGE REWARDS (Create / Update / Delete)
    if (req.method === 'POST' && action === 'admin-reward') {
      const { id, title, description, pointsCost, discountType, discountValue, minOrderValue, isActive, _action } = req.body || {};

      if (_action === 'delete' && id) {
        await (prisma as any).loyaltyReward.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Nagroda usunięta' });
      }

      if (id) {
        // Update
        const updated = await (prisma as any).loyaltyReward.update({
          where: { id },
          data: {
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(pointsCost !== undefined ? { pointsCost: Number(pointsCost) } : {}),
            ...(discountType !== undefined ? { discountType } : {}),
            ...(discountValue !== undefined ? { discountValue: Number(discountValue) } : {}),
            ...(minOrderValue !== undefined ? { minOrderValue: Number(minOrderValue) } : {}),
            ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          },
        });
        return res.status(200).json({ success: true, reward: updated });
      }

      // Create new reward
      if (!title || !pointsCost || !discountValue) {
        return res.status(400).json({ message: 'Title, pointsCost and discountValue are required' });
      }

      const created = await (prisma as any).loyaltyReward.create({
        data: {
          title,
          description: description || '',
          pointsCost: Number(pointsCost),
          discountType: discountType || 'FIXED',
          discountValue: Number(discountValue),
          minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });

      return res.status(201).json({ success: true, reward: created });
    }

    // 5. ADMIN: ADJUST USER POINTS
    if (req.method === 'POST' && action === 'admin-adjust') {
      const { targetUserId, points, reason } = req.body || {};
      if (!targetUserId || points === undefined) {
        return res.status(400).json({ message: 'targetUserId and points are required' });
      }

      const pointsDiff = Number(points);
      const updatedUser = await (prisma as any).user.update({
        where: { id: targetUserId },
        data: {
          loyaltyPoints: { increment: pointsDiff },
        },
      });

      await (prisma as any).loyaltyHistory.create({
        data: {
          userId: targetUserId,
          points: pointsDiff,
          type: 'ADMIN_ADJUST',
          description: reason || `Korekta administratora: ${pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff} pkt`,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Punkty zostały zaktualizowane',
        newBalance: updatedUser.loyaltyPoints,
      });
    }

    // 6. ADMIN: LIST ALL USERS & STATS
    if (req.method === 'GET' && action === 'admin-users') {
      const users = await (prisma as any).user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
          _count: {
            select: { orders: true, userCoupons: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ users });
    }

    return res.status(404).json({ message: `Action '${action}' not supported in Loyalty API` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Loyalty Handler Error:', err);
    return res.status(500).json({ message: 'Loyalty API error', error: err.message });
  }
}
