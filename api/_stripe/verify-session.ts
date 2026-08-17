import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.query.session_id as string) || (req.body?.session_id as string);

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  // Handle Demo / Mock checkout simulation
  if (sessionId.startsWith('mock_session_') || sessionId.startsWith('mock_sess_')) {
    return res.status(200).json({
      success: true,
      demoMode: true,
      order: {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        status: 'Paid',
        total: 189.00,
        currency: 'EUR',
        customerEmail: 'customer@example.com',
        customerName: 'Valued Customer',
        shippingAddress: {
          line1: 'Grafton Street 42',
          city: 'Dublin',
          postalCode: 'D02 X285',
          country: 'Ireland',
        },
        createdAt: new Date().toISOString(),
      },
    });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(500).json({ message: 'Stripe secret key not configured on server' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'shipping_details'],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found on Stripe' });
    }

    const isPaid = session.payment_status === 'paid';
    const total = (session.amount_total || 0) / 100;
    const customerEmail = session.customer_details?.email || session.customer_email || undefined;
    const customerName = session.customer_details?.name || session.shipping_details?.name || 'Customer';
    const shippingAddress = session.shipping_details?.address;
    const userId = session.metadata?.userId !== 'guest' ? session.metadata?.userId : null;

    let savedOrder: any = null;

    // Persist order in Prisma if userId exists
    if (isPaid && userId) {
      try {
        // Check if order with this session was already created
        const existingOrder = await (prisma as any).order.findFirst({
          where: {
            userId,
            total,
            createdAt: {
              gte: new Date(Date.now() - 3600000), // last hour
            },
          },
          include: { items: true },
        });

        if (!existingOrder) {
          // Parse items summary metadata
          let rawItems: any[] = [];
          try {
            if (session.metadata?.itemsSummary) {
              rawItems = JSON.parse(session.metadata.itemsSummary);
            }
          } catch {
            rawItems = [];
          }

          savedOrder = await (prisma as any).order.create({
            data: {
              userId,
              total,
              status: 'Paid',
              items: {
                create: rawItems.map((item: any) => ({
                  productId: String(item.id || 'item'),
                  name: String(item.name || 'Jewelry Piece'),
                  price: Number(item.price) || 0,
                  quantity: Number(item.qty) || 1,
                  image: item.image || '',
                })),
              },
            },
            include: {
              items: true,
            },
          });
        } else {
          savedOrder = existingOrder;
        }
      } catch (dbErr) {
        console.error('Error saving order to Prisma:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      demoMode: false,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
        customerEmail,
        customerName,
        shippingAddress,
        amountTotal: total,
        currency: session.currency?.toUpperCase() || 'EUR',
      },
      order: savedOrder,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Verify Stripe Session Error:', err);
    return res.status(500).json({
      message: 'Failed to verify checkout session',
      error: err.message,
    });
  }
}
