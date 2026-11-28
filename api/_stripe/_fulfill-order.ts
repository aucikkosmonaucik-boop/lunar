import type Stripe from 'stripe';
import { prisma } from '../_lib/prisma.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';
import {
  notifyPaymentConfirmed,
  notifyOrderPlaced,
  notifyLoyaltyPointsEarned,
} from '../_lib/notifications.js';

/**
 * Finds the order associated with a Stripe PaymentIntent and atomically marks
 * it as paid if the PaymentIntent succeeded, dispatching emails and loyalty points once.
 */
export async function fulfillOrderFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const orConditions: Record<string, string>[] = [
    { stripePaymentIntentId: paymentIntent.id },
    { stripeSessionId: paymentIntent.id },
  ];

  if (paymentIntent.metadata?.orderNumber) {
    orConditions.push({ orderNumber: paymentIntent.metadata.orderNumber });
  }
  if (paymentIntent.metadata?.orderId) {
    orConditions.push({ id: paymentIntent.metadata.orderId });
  }

  let order = await (prisma as any).order.findFirst({
    where: { OR: orConditions },
    include: { items: true },
  });

  if (!order) {
    return null;
  }

  if (paymentIntent.status === 'succeeded' && order.paymentStatus !== 'paid') {
    const updateResult = await (prisma as any).order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { not: 'paid' },
      },
      data: {
        status: 'Paid',
        paymentStatus: 'paid',
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (updateResult.count > 0) {
      order = await (prisma as any).order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }

      try {
        if (order?.userId) {
          await notifyPaymentConfirmed(order.userId, order.orderNumber, Number(order.total));
          await notifyOrderPlaced(order.userId, order.orderNumber, Number(order.total));

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
  }

  return order;
}
