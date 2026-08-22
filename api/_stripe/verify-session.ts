import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_lib/prisma.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.query.session_id as string) || (req.body?.session_id as string);

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  // 1. Handle Demo / Mock checkout simulation
  if (sessionId.startsWith('mock_session_') || sessionId.startsWith('mock_sess_')) {
    let customAddress = null;
    if (req.query.address) {
      try {
        customAddress = JSON.parse(decodeURIComponent(req.query.address as string));
      } catch {
        customAddress = null;
      }
    }

    try {
      // Find existing order in Postgres
      let order = await (prisma as any).order.findFirst({
        where: { stripeSessionId: sessionId },
        include: { items: true },
      });

      if (!order && customAddress) {
        const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        order = await (prisma as any).order.create({
          data: {
            orderNumber,
            userId: null,
            customerEmail: customAddress.email || 'guest@example.com',
            customerName: customAddress.name || 'Guest Customer',
            shippingPhone: customAddress.phone || null,
            shippingStreet: customAddress.street || 'Grafton Street 42',
            shippingCity: customAddress.city || 'Dublin',
            shippingPostalCode: customAddress.postalCode || 'D02 X285',
            shippingCountry: customAddress.country || 'IE',
            total: 189.00,
            subtotal: 189.00,
            status: 'Paid',
            paymentStatus: 'paid',
            paymentMethod: 'demo',
            stripeSessionId: sessionId,
            items: {
              create: [
                {
                  productId: '1',
                  name: 'Celestial Solitaire Ring',
                  price: 189.00,
                  quantity: 1,
                  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
                },
              ],
            },
          },
          include: { items: true },
        });

        if (order) {
          try {
            await sendOrderConfirmationEmail(order);
          } catch (emailErr) {
            console.error('Failed to send demo order confirmation email:', emailErr);
          }
        }
      }

      return res.status(200).json({
        success: true,
        demoMode: true,
        order: {
          id: order?.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
          status: order?.status || 'Paid',
          total: order?.total || 189.00,
          currency: 'EUR',
          customerEmail: order?.customerEmail || customAddress?.email || 'customer@example.com',
          customerName: order?.customerName || customAddress?.name || 'Valued Customer',
          shippingPhone: order?.shippingPhone || customAddress?.phone || null,
          shippingAddress: {
            line1: order?.shippingStreet || customAddress?.street || 'Grafton Street 42',
            city: order?.shippingCity || customAddress?.city || 'Dublin',
            postalCode: order?.shippingPostalCode || customAddress?.postalCode || 'D02 X285',
            country: order?.shippingCountry || customAddress?.country || 'Ireland',
            phone: order?.shippingPhone || customAddress?.phone || null,
          },
          createdAt: order?.createdAt || new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error('Demo verification database error:', err);
    }
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
    const customerEmail = session.metadata?.customerEmail || session.customer_details?.email || session.customer_email || 'customer@lunar.ie';
    const customerName = session.metadata?.customerName || session.customer_details?.name || session.shipping_details?.name || 'Customer';
    const shippingPhone = session.metadata?.shippingPhone || session.customer_details?.phone || null;
    const shippingStreet = session.metadata?.shippingStreet || session.shipping_details?.address?.line1 || 'Shipping Address';
    const shippingCity = session.metadata?.shippingCity || session.shipping_details?.address?.city || '';
    const shippingPostalCode = session.metadata?.shippingPostalCode || session.shipping_details?.address?.postal_code || '';
    const shippingCountry = session.metadata?.shippingCountry || session.shipping_details?.address?.country || 'PL';
    const userId = session.metadata?.userId && session.metadata.userId !== 'guest' ? session.metadata.userId : null;

    let savedOrder: any = null;

    // Persist or Update Order in PostgreSQL
    try {
      // Find existing order by Stripe Session ID
      const existingOrder = await (prisma as any).order.findFirst({
        where: { stripeSessionId: session.id },
        include: { items: true },
      });

      if (existingOrder) {
        // Update order status to Paid once verified
        savedOrder = await (prisma as any).order.update({
          where: { id: existingOrder.id },
          data: {
            status: isPaid ? 'Paid' : existingOrder.status,
            paymentStatus: isPaid ? 'paid' : existingOrder.paymentStatus,
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          },
          include: { items: true },
        });
        console.log(`✅ Order ${savedOrder.orderNumber} updated to status Paid in PostgreSQL.`);
      } else if (isPaid) {
        // Parse items summary metadata
        let rawItems: any[] = [];
        try {
          if (session.metadata?.itemsSummary) {
            rawItems = JSON.parse(session.metadata.itemsSummary);
          }
        } catch {
          rawItems = [];
        }

        const orderNumber = session.metadata?.orderNumber || `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        savedOrder = await (prisma as any).order.create({
          data: {
            orderNumber,
            userId: userId || null, // null for guest checkout
            customerEmail: customerEmail.trim(),
            customerName: customerName.trim(),
            shippingPhone: shippingPhone?.trim() || null,
            shippingStreet: shippingStreet.trim(),
            shippingCity: shippingCity.trim(),
            shippingPostalCode: shippingPostalCode.trim(),
            shippingCountry: shippingCountry.trim(),
            total,
            subtotal: Number(session.metadata?.subtotal) || total,
            discountCode: session.metadata?.discountCode || null,
            discountAmount: Number(session.metadata?.discountAmount) || 0,
            shippingFee: Number(session.metadata?.shippingFee) || 0,
            status: 'Paid',
            paymentStatus: 'paid',
            paymentMethod: 'stripe',
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
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
        console.log(`✅ Order ${savedOrder.orderNumber} (Guest/User) created in PostgreSQL.`);
      }

      // Send confirmation email via Resend if payment is confirmed
      if (savedOrder && isPaid) {
        const wasAlreadyPaid = existingOrder && existingOrder.paymentStatus === 'paid';
        if (!wasAlreadyPaid) {
          try {
            await sendOrderConfirmationEmail(savedOrder);
          } catch (emailErr) {
            console.error('Failed to send Stripe order confirmation email:', emailErr);
          }
        }
      }
    } catch (dbErr) {
      console.error('Error saving/updating order in PostgreSQL:', dbErr);
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
        shippingPhone,
        shippingAddress: {
          line1: shippingStreet,
          city: shippingCity,
          postal_code: shippingPostalCode,
          country: shippingCountry,
          phone: shippingPhone,
        },
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
