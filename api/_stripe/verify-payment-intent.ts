import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripeSecretKey } from './_stripe-key.js';
import { fulfillOrderFromPaymentIntent } from './_fulfill-order.js';

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

    const order = await fulfillOrderFromPaymentIntent(paymentIntent);

    if (!order) {
      return res.status(404).json({ message: 'Order associated with this PaymentIntent not found.' });
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
