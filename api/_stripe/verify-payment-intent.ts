import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_lib/prisma.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';
import { notifyPaymentConfirmed, notifyOrderPlaced, notifyLoyaltyPointsEarned } from '../_lib/notifications.js';
import { getStripeSecretKey } from './_stripe-key.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const paymentIntentId =
    (req.query.payment_intent_id as string) ||
    (req.query.payment_intent as string) ||
    (req.body?.payment_intent_id as string) ||
    (req.body?.payment_intent as string);

  if (!paymentIntentId) {
    return res.status(400).json({ message: 'Payment Intent ID is required' });
  }

  const stripeSecretKey = getStripeSecretKey();
  if (!stripeSecretKey) {
    return res.status(500).json({ message: 'Stripe secret key is not configured.' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the corresponding order in Postgres
    let order = await (prisma as any).order.findFirst({
      where: {
        OR: [
          { stripeSessionId: paymentIntentId },
          { orderNumber: paymentIntent.metadata?.orderNumber || '' },
          { id: paymentIntent.metadata?.orderId || '' },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order associated with this PaymentIntent not found.' });
    }

    // If PaymentIntent succeeded and order is still Pending
    if (paymentIntent.status === 'succeeded' && order.paymentStatus !== 'paid') {
      const updatedOrder = await (prisma as any).order.update({
        where: { id: order.id },
        data: {
          status: 'Paid',
          paymentStatus: 'paid',
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        },
        include: { items: true },
      });

      order = updatedOrder;

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }

      // Send in-app notifications
      try {
        if (order.userId) {
          await notifyPaymentConfirmed(order.userId, order.orderNumber, Number(order.total));
          await notifyOrderPlaced(order.userId, order.orderNumber, Number(order.total));

          // Award loyalty points (10 points per 1 EUR)
          const pointsEarned = Math.max(10, Math.floor(Number(order.total) * 10));
          await (prisma as any).user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoints: { increment: pointsEarned },
            },
          });
          await notifyLoyaltyPointsEarned(order.userId, pointsEarned, 'order');
        }
      } catch (notifErr) {
        console.error('Failed to dispatch notifications or loyalty points:', notifErr);
      }
    }

    return res.status(200).json({
      success: true,
      paymentStatus: paymentIntent.status,
      isPaid: paymentIntent.status === 'succeeded',
      order: {
        id: order.orderNumber,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || 'card',
        total: Number(order.total),
        subtotal: Number(order.subtotal || order.total),
        shippingFee: Number(order.shippingFee || 0),
        discountAmount: Number(order.discountAmount || 0),
        discountCode: order.discountCode || null,
        currency: 'EUR',
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        shippingPhone: order.shippingPhone,
        shippingStreet: order.shippingStreet,
        shippingCity: order.shippingCity,
        shippingPostalCode: order.shippingPostalCode,
        shippingCountry: order.shippingCountry,
        shippingAddress: {
          line1: order.shippingStreet,
          city: order.shippingCity,
          postal_code: order.shippingPostalCode,
          country: order.shippingCountry,
          phone: order.shippingPhone,
        },
        items: order.items,
        carrier: order.carrier,
        carrierName: order.carrierName,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Verify PaymentIntent Error:', error);
    return res.status(500).json({
      message: error?.message || 'Failed to verify payment intent.',
    });
  }
}
