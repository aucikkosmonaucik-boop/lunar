import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // GET: List all promo codes (for admin)
  if (req.method === 'GET') {
    try {
      const promos = await (prisma as any).promoCode.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ promos });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('List Promos Error:', err);
      return res.status(500).json({ message: 'Failed to fetch promo codes', error: err.message });
    }
  }

  // DELETE: Delete a promo code
  if (req.method === 'DELETE') {
    try {
      const { id, code } = req.query as { id?: string; code?: string };
      const body = req.body || {};
      const targetId = id || body.id;
      const targetCode = code || body.code;

      if (!targetId && !targetCode) {
        return res.status(400).json({ message: 'ID or Code is required for deletion' });
      }

      await (prisma as any).promoCode.deleteMany({
        where: {
          ...(targetId ? { id: targetId } : {}),
          ...(targetCode ? { code: targetCode.toUpperCase() } : {}),
        },
      });

      return res.status(200).json({ success: true, message: 'Promo code deleted' });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Delete Promo Error:', err);
      return res.status(500).json({ message: 'Failed to delete promo code', error: err.message });
    }
  }

  // PATCH / PUT: Toggle or update promo code
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { id } = req.query as { id?: string };
      const body = req.body || {};
      const targetId = id || body.id;

      if (!targetId) {
        return res.status(400).json({ message: 'Promo code ID is required' });
      }

      const updated = await (prisma as any).promoCode.update({
        where: { id: targetId },
        data: {
          ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
          ...(body.discountPct !== undefined ? { discountPct: Number(body.discountPct) } : {}),
          ...(body.discountAmount !== undefined ? { discountAmount: body.discountAmount ? Number(body.discountAmount) : null } : {}),
          ...(body.minOrderValue !== undefined ? { minOrderValue: Number(body.minOrderValue) } : {}),
          ...(body.maxUses !== undefined ? { maxUses: body.maxUses ? Number(body.maxUses) : null } : {}),
          ...(body.expiresAt !== undefined ? { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } : {}),
        },
      });

      return res.status(200).json({ success: true, promo: updated });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Update Promo Error:', err);
      return res.status(500).json({ message: 'Failed to update promo code', error: err.message });
    }
  }

  // POST: Either create new promo code (if action === 'create') OR validate code on checkout
  if (req.method === 'POST') {
    const { action } = req.query as { action?: string };
    const body = req.body || {};

    // 1. Create new promo code
    if (action === 'create' || body.action === 'create') {
      try {
        const { code, discountPct, discountAmount, minOrderValue, expiresAt, maxUses, isActive } = body;

        if (!code || (discountPct === undefined && discountAmount === undefined)) {
          return res.status(400).json({ message: 'Code and either discountPct or discountAmount are required' });
        }

        const normalizedCode = code.toUpperCase().trim();

        // Check if code already exists
        const existing = await (prisma as any).promoCode.findUnique({
          where: { code: normalizedCode },
        });

        if (existing) {
          return res.status(409).json({ message: 'Promo code with this name already exists' });
        }

        const promo = await (prisma as any).promoCode.create({
          data: {
            code: normalizedCode,
            discountPct: discountPct ? Number(discountPct) : 0,
            discountAmount: discountAmount ? Number(discountAmount) : null,
            minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            maxUses: maxUses ? Number(maxUses) : null,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
          },
        });

        return res.status(201).json({ success: true, promo });
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Create Promo Error:', err);
        return res.status(500).json({ message: 'Failed to create promo code', error: err.message });
      }
    }

    // 2. Validate promo code (Checkout flow)
    const { code, orderAmount } = body as { code?: string; orderAmount?: number };

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Promo code is required' });
    }

    try {
      const normalizedCode = code.toUpperCase().trim();

      // Check in standard PromoCode table
      const promo = await (prisma as any).promoCode.findUnique({
        where: { code: normalizedCode },
      });

      if (promo && promo.isActive) {
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
          return res.status(400).json({ valid: false, message: 'Promo code has expired' });
        }

        if (promo.maxUses && promo.usageCount >= promo.maxUses) {
          return res.status(400).json({ valid: false, message: 'Promo code usage limit reached' });
        }

        const currentTotal = Number(orderAmount) || 0;
        if (promo.minOrderValue && currentTotal < promo.minOrderValue) {
          return res.status(400).json({
            valid: false,
            message: `Order total must be at least ${promo.minOrderValue.toFixed(2)}€ to apply this code.`,
          });
        }

        return res.status(200).json({
          valid: true,
          code: promo.code,
          discountPct: promo.discountPct,
          discountAmount: promo.discountAmount,
        });
      }

      // Also check in UserCoupon table (Coupons bought with loyalty points!)
      const userCoupon = await (prisma as any).userCoupon.findUnique({
        where: { code: normalizedCode },
      });

      if (userCoupon) {
        if (userCoupon.isUsed) {
          return res.status(400).json({ valid: false, message: 'This loyalty coupon has already been used' });
        }

        if (userCoupon.expiresAt && new Date(userCoupon.expiresAt) < new Date()) {
          return res.status(400).json({ valid: false, message: 'This loyalty coupon has expired' });
        }

        const currentTotal = Number(orderAmount) || 0;
        if (userCoupon.minOrderValue && currentTotal < userCoupon.minOrderValue) {
          return res.status(400).json({
            valid: false,
            message: `Order total must be at least ${userCoupon.minOrderValue.toFixed(2)}€ to apply this coupon.`,
          });
        }

        return res.status(200).json({
          valid: true,
          code: userCoupon.code,
          discountPct: userCoupon.discountType === 'PERCENTAGE' ? userCoupon.discountValue : 0,
          discountAmount: userCoupon.discountType === 'FIXED' ? userCoupon.discountValue : null,
          isLoyaltyCoupon: true,
        });
      }

      // Hardcoded fallback checks for demo
      if (normalizedCode === 'LUNAR10' || normalizedCode === 'WELCOME10') {
        return res.status(200).json({ valid: true, code: normalizedCode, discountPct: 10, discountAmount: null });
      }
      if (normalizedCode === 'VIP15') {
        return res.status(200).json({ valid: true, code: normalizedCode, discountPct: 15, discountAmount: null });
      }

      return res.status(404).json({ valid: false, message: 'Invalid or inactive promo code' });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Promo Code Validation Error:', err);
      return res.status(500).json({
        valid: false,
        message: 'Server error validating promo code',
        error: err.message,
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
