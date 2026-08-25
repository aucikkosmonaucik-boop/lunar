import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken } from '../_lib/auth-util.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';
import { notifyOrderPlaced, notifyLoyaltyPointsEarned } from '../_lib/notifications.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractToken(req);

  let userId: string | null = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      // Guest order
    }
  }

  try {
    const {
      items,
      total,
      subtotal,
      discountCode,
      discountAmount,
      shippingFee,
      paymentMethod,
      orderNotes,
      shippingAddress,
      carrier,
      carrierName,
      estimatedDelivery,
    } = req.body;

    interface CartItem {
      product: {
        id: string;
        name: string;
        price: number;
        image: string;
      };
      quantity: number;
      selectedOptions?: string;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email || !shippingAddress.street) {
      return res.status(400).json({ message: 'Valid shipping address details are required' });
    }

    const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerEmail: shippingAddress.email.trim(),
        customerName: shippingAddress.name.trim(),
        shippingPhone: shippingAddress.phone || null,
        shippingStreet: shippingAddress.street.trim(),
        shippingCity: shippingAddress.city?.trim() || '',
        shippingPostalCode: shippingAddress.postalCode?.trim() || '',
        shippingCountry: shippingAddress.country?.trim() || 'PL',
        orderNotes: orderNotes || null,
        subtotal: subtotal ? Number(subtotal) : Number(total),
        discountCode: discountCode || null,
        discountAmount: discountAmount ? Number(discountAmount) : 0,
        shippingFee: shippingFee !== undefined ? Number(shippingFee) : 0,
        total: Number(total),
        status: 'Processing',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'card',
        carrier: carrier || 'AN_POST',
        carrierName: carrierName || 'An Post',
        estimatedDelivery: estimatedDelivery || '1 – 3 Business Days',
        items: {
          create: items.map((item: CartItem) => ({
            productId: item.product?.id || null,
            name: item.product?.name || 'Item',
            price: Number(item.product?.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.product?.image || '',
            selectedOptions: item.selectedOptions || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Handle Loyalty Points for Authenticated User (10 pts per EUR/PLN)
    let pointsEarned = 0;
    if (userId) {
      try {
        pointsEarned = Math.max(10, Math.floor(Number(total) * 10));
        await (prisma as any).user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: { increment: pointsEarned },
          },
        });

        await (prisma as any).loyaltyHistory.create({
          data: {
            userId,
            points: pointsEarned,
            type: 'PURCHASE',
            description: `Punkty za zamówienie #${orderNumber} (+${pointsEarned} pkt)`,
            orderId: order.id,
          },
        });

        // Trigger in-app loyalty points notification
        await notifyLoyaltyPointsEarned(userId, pointsEarned, orderNumber);
      } catch (ptsErr) {
        console.warn('Could not record loyalty points:', ptsErr);
      }
    }

    // Trigger in-app order confirmation notification for authenticated user
    if (userId) {
      try {
        await notifyOrderPlaced(order);
      } catch (notifErr) {
        console.warn('Could not send in-app order notification:', notifErr);
      }
    }

    // Handle Promo Code or Loyalty Coupon Usage
    if (discountCode) {
      try {
        const normalizedCode = discountCode.toUpperCase().trim();
        // Check if user coupon
        await (prisma as any).userCoupon.updateMany({
          where: { code: normalizedCode },
          data: { isUsed: true, usedAt: new Date() },
        });

        // Check if standard promo code
        await (prisma as any).promoCode.updateMany({
          where: { code: normalizedCode },
          data: { usageCount: { increment: 1 } },
        });
      } catch (promoErr) {
        console.warn('Could not mark promo code as used:', promoErr);
      }
    }

    // Send Order Confirmation Email via Resend
    try {
      await sendOrderConfirmationEmail(order, { pointsEarned });
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
    }

    return res.status(201).json({
      message: 'Order created successfully',
      order,
      loyaltyPointsEarned: pointsEarned,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Order Creation Error:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
}
