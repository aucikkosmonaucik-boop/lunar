import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_lib/prisma.js';
import { getStripeSecretKey } from './_stripe/_stripe-key.js';
import { fulfillOrderFromPaymentIntent } from './_stripe/_fulfill-order.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf-8');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripeSecretKey = getStripeSecretKey();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Stripe webhook called without STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET configured.');
    return res.status(500).json({ message: 'Stripe webhook is not configured on the server.' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Missing stripe-signature header.' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    const stripe = new Stripe(stripeSecretKey);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err?.message);
    return res.status(400).json({ message: `Webhook Error: ${err?.message || 'Invalid signature'}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await fulfillOrderFromPaymentIntent(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await (prisma as any).order.updateMany({
          where: {
            OR: [
              { stripePaymentIntentId: paymentIntent.id },
              { stripeSessionId: paymentIntent.id },
            ],
            paymentStatus: 'pending',
          },
          data: {
            paymentStatus: 'failed',
          },
        });
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook handler error:', err);
    return res.status(500).json({ message: 'Webhook processing failed.' });
  }
}
