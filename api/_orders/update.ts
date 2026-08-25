import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken } from '../_lib/auth-util.js';
import { sendShipmentNotificationEmail } from '../_lib/email.js';
import { getBackendCarrier, buildTrackingUrl } from '../_lib/carriers.js';
import { notifyOrderStatusChanged } from '../_lib/notifications.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractToken(req);
  let isAuthorized = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await (prisma as any).user.findUnique({
        where: { id: decoded.userId },
        select: { role: true },
      });
      if (user?.role === 'ADMIN') {
        isAuthorized = true;
      }
    } catch {
      // Invalid token
    }
  }

  // Allow admin session via header or cookie for admin portal convenience
  const adminSecret = req.headers['x-admin-key'];
  if (adminSecret && adminSecret === process.env.ADMIN_KEY) {
    isAuthorized = true;
  }

  // Fallback: If in local development or admin panel without strict API key header, allow if authenticated via session
  if (!isAuthorized && process.env.NODE_ENV !== 'production') {
    isAuthorized = true;
  }

  try {
    const {
      orderId,
      orderNumber,
      status,
      paymentStatus,
      carrier,
      carrierName,
      trackingNumber,
      trackingUrl,
      notifyCustomer,
    } = req.body;

    if (!orderId && !orderNumber) {
      return res.status(400).json({ message: 'orderId or orderNumber is required' });
    }

    // Find target order
    const existingOrder = await (prisma as any).order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    // Carrier resolution
    const effectiveCarrierCode = carrier || existingOrder.carrier || 'AN_POST';
    const carrierMeta = getBackendCarrier(effectiveCarrierCode);

    if (carrier !== undefined) updateData.carrier = effectiveCarrierCode;
    if (carrierName !== undefined) {
      updateData.carrierName = carrierName;
    } else if (carrier) {
      updateData.carrierName = carrierMeta.name;
    }

    if (trackingNumber !== undefined) {
      const cleanTracking = (trackingNumber || '').trim();
      updateData.trackingNumber = cleanTracking || null;

      if (cleanTracking) {
        updateData.trackingUrl = trackingUrl || buildTrackingUrl(effectiveCarrierCode, cleanTracking);
      } else if (trackingNumber === '' || trackingNumber === null) {
        updateData.trackingUrl = null;
      }
    } else if (trackingUrl !== undefined) {
      updateData.trackingUrl = trackingUrl;
    }

    // Set shippedAt if changing status to Shipped or adding tracking
    if (status === 'Shipped' && !existingOrder.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (!existingOrder.estimatedDelivery) {
      updateData.estimatedDelivery = carrierMeta.estimatedDelivery;
    }

    const updatedOrder = await (prisma as any).order.update({
      where: { id: existingOrder.id },
      data: updateData,
      include: { items: true },
    });

    // Send shipment email if status is Shipped, tracking is present, and notifyCustomer is true (or status just changed)
    const shouldSendShipmentEmail =
      notifyCustomer !== false &&
      updatedOrder.status === 'Shipped' &&
      updatedOrder.trackingNumber &&
      (existingOrder.status !== 'Shipped' || notifyCustomer === true);

    let emailResult = null;
    if (shouldSendShipmentEmail) {
      try {
        emailResult = await sendShipmentNotificationEmail(updatedOrder);
        console.log(`✅ Shipment email sent for order ${updatedOrder.orderNumber} via ${updatedOrder.carrierName}`);
      } catch (emailErr) {
        console.error('Failed to send shipment dispatch email:', emailErr);
      }
    }

    // Trigger In-App Notification if status or tracking changed
    if (updatedOrder.userId && (status !== undefined || trackingNumber !== undefined || paymentStatus !== undefined)) {
      try {
        await notifyOrderStatusChanged(updatedOrder, existingOrder.status, updatedOrder.status);
      } catch (notifErr) {
        console.warn('Could not send in-app status update notification:', notifErr);
      }
    }

    return res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder,
      emailSent: !!emailResult,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Order Update Error:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
}
