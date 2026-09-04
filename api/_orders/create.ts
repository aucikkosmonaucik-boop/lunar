import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken, getJwtSecret } from '../_lib/auth-util.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';
import { notifyOrderPlaced, notifyLoyaltyPointsEarned } from '../_lib/notifications.js';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractToken(req);
  let userId: string | null = null;

  if (token) {
    try {
      const jwtSecret = getJwtSecret();
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as { userId: string };
      userId = decoded.userId;
    } catch {
      // Guest order
    }
  }

  try {
    const {
      items,
      discountCode,
      paymentMethod,
      orderNotes,
      shippingAddress,
      carrier,
      carrierName,
      estimatedDelivery,
    } = req.body || {};

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

    // 1. Fetch products from DB to verify real prices (Defense against price tampering)
    const productIds = items
      .map((it: CartItem) => it.product?.id)
      .filter((id: any) => typeof id === 'string');

    const dbProducts = await (prisma as any).product.findMany({
      where: { id: { in: productIds } },
    });

    const dbProductMap = new Map<string, any>();
    dbProducts.forEach((p: any) => dbProductMap.set(p.id, p));

    let calculatedSubtotal = 0;
    const verifiedItems = items.map((item: CartItem) => {
      const pId = item.product?.id;
      const dbProduct = pId ? dbProductMap.get(pId) : null;
      const verifiedPrice = dbProduct ? Number(dbProduct.price) : Math.max(0, Number(item.product?.price || 0));
      const verifiedQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity || 1))));
      calculatedSubtotal += verifiedPrice * verifiedQty;

      return {
        productId: dbProduct ? dbProduct.id : (pId || null),
        name: dbProduct ? dbProduct.name : (item.product?.name || 'Item'),
        price: verifiedPrice,
        quantity: verifiedQty,
        image: dbProduct ? dbProduct.image : (item.product?.image || ''),
        selectedOptions: item.selectedOptions ? String(item.selectedOptions).slice(0, 100) : null,
      };
    });

    // 2. Validate discount code on server side
    let verifiedDiscountAmount = 0;
    let normalizedCode: string | null = null;

    if (discountCode) {
      normalizedCode = String(discountCode).trim().toUpperCase();
      const promo = await (prisma as any).promoCode.findUnique({
        where: { code: normalizedCode },
      });

      if (promo && promo.isActive) {
        if (promo.discountPct) {
          verifiedDiscountAmount = (calculatedSubtotal * promo.discountPct) / 100;
        } else if (promo.discountAmount) {
          verifiedDiscountAmount = Math.min(calculatedSubtotal, promo.discountAmount);
        }
      } else {
        // Also check loyalty user coupons
        const coupon = await (prisma as any).userCoupon.findUnique({
          where: { code: normalizedCode },
        });
        if (coupon && !coupon.isUsed) {
          if (coupon.discountType === 'PERCENTAGE') {
            verifiedDiscountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          } else {
            verifiedDiscountAmount = Math.min(calculatedSubtotal, coupon.discountValue);
          }
        }
      }
    }

    const priceAfterDiscount = Math.max(0, calculatedSubtotal - verifiedDiscountAmount);
    const verifiedShippingFee = priceAfterDiscount >= 50 ? 0 : 10;
    const verifiedTotal = Number((priceAfterDiscount + verifiedShippingFee).toFixed(2));

    const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerEmail: String(shippingAddress.email).trim().toLowerCase(),
        customerName: String(shippingAddress.name).trim().slice(0, 100),
        shippingPhone: shippingAddress.phone ? String(shippingAddress.phone).trim().slice(0, 30) : null,
        shippingStreet: String(shippingAddress.street).trim().slice(0, 150),
        shippingCity: String(shippingAddress.city || '').trim().slice(0, 80),
        shippingPostalCode: String(shippingAddress.postalCode || '').trim().slice(0, 30),
        shippingCountry: String(shippingAddress.country || 'PL').trim().slice(0, 60),
        orderNotes: orderNotes ? String(orderNotes).trim().slice(0, 500) : null,
        subtotal: calculatedSubtotal,
        discountCode: normalizedCode,
        discountAmount: verifiedDiscountAmount,
        shippingFee: verifiedShippingFee,
        total: verifiedTotal,
        status: 'Processing',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'card',
        carrier: carrier || 'AN_POST',
        carrierName: carrierName || 'An Post',
        estimatedDelivery: estimatedDelivery || '1 – 3 Business Days',
        items: {
          create: verifiedItems,
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
        pointsEarned = Math.max(10, Math.floor(verifiedTotal * 10));
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

        await notifyLoyaltyPointsEarned(userId, pointsEarned, orderNumber);
      } catch (ptsErr) {
        console.warn('Could not record loyalty points:', ptsErr);
      }
    }

    if (userId) {
      try {
        await notifyOrderPlaced(order);
      } catch (notifErr) {
        console.warn('Could not send in-app order notification:', notifErr);
      }
    }

    // Mark promo/coupon as used
    if (normalizedCode) {
      try {
        await (prisma as any).userCoupon.updateMany({
          where: { code: normalizedCode },
          data: { isUsed: true, usedAt: new Date() },
        });

        await (prisma as any).promoCode.updateMany({
          where: { code: normalizedCode },
          data: { usageCount: { increment: 1 } },
        });
      } catch (promoErr) {
        console.warn('Could not mark promo code as used:', promoErr);
      }
    }

    // Send Order Confirmation Email
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
  } catch (error) {
    console.error('Order Creation Error:', error);
    return res.status(500).json({
      message: 'Internal server error occurred while creating order.',
    });
  }
}
