import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, orderAmount } = req.body as { code?: string; orderAmount?: number };

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, message: 'Promo code is required' });
  }

  try {
    const promo = await (prisma as any).promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo || !promo.isActive) {
      return res.status(404).json({ valid: false, message: 'Invalid or inactive promo code' });
    }

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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Promo Code Error:', err);
    return res.status(500).json({
      valid: false,
      message: 'Server error validating promo code',
      error: err.message,
    });
  }
}
