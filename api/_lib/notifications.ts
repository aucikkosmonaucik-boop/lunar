import { prisma } from './prisma.js';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'ORDER' | 'SHIPPING' | 'PAYMENT' | 'LOYALTY' | 'PROMO';
  orderId?: string;
  orderNumber?: string;
  linkUrl?: string;
}

/**
 * Creates an in-app notification in PostgreSQL for an authenticated user.
 */
export async function createNotification(params: CreateNotificationParams) {
  if (!params.userId) return null;

  try {
    const notification = await (prisma as any).notification.create({
      data: {
        userId: params.userId,
        title: params.title.trim(),
        message: params.message.trim(),
        type: params.type || 'ORDER',
        orderId: params.orderId || null,
        orderNumber: params.orderNumber || null,
        linkUrl: params.linkUrl || (params.orderNumber ? `/track-order?orderNumber=${params.orderNumber}` : null),
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
    return null;
  }
}

/**
 * Notify customer when a new order is placed
 */
export async function notifyOrderPlaced(order: any) {
  if (!order || !order.userId) return null;

  const orderNum = order.orderNumber || 'LUNAR';
  return createNotification({
    userId: order.userId,
    title: '✨ Order Confirmed',
    message: `Your order #${orderNum} has been received and is being prepared with care.`,
    type: 'ORDER',
    orderId: order.id,
    orderNumber: orderNum,
    linkUrl: `/track-order?orderNumber=${orderNum}`,
  });
}

/**
 * Notify customer when payment is successfully confirmed
 */
export async function notifyPaymentConfirmed(order: any) {
  if (!order || !order.userId) return null;

  const orderNum = order.orderNumber || 'LUNAR';
  const totalFormatted = Number(order.total || 0).toFixed(2);

  return createNotification({
    userId: order.userId,
    title: '💳 Payment Received',
    message: `Payment of €${totalFormatted} for order #${orderNum} has been verified successfully.`,
    type: 'PAYMENT',
    orderId: order.id,
    orderNumber: orderNum,
    linkUrl: `/track-order?orderNumber=${orderNum}`,
  });
}

/**
 * Notify customer when order status or courier tracking changes
 */
export async function notifyOrderStatusChanged(order: any, previousStatus?: string, newStatus?: string) {
  if (!order || !order.userId) return null;

  const status = (newStatus || order.status || '').toLowerCase();
  const orderNum = order.orderNumber || 'LUNAR';
  const carrierName = order.carrierName || 'Courier';
  const trackingNumber = order.trackingNumber;

  if (status === 'shipped') {
    const trackingInfo = trackingNumber ? ` (Tracking: ${trackingNumber})` : '';
    return createNotification({
      userId: order.userId,
      title: '📦 Parcel Dispatched',
      message: `Your order #${orderNum} has been dispatched via ${carrierName}${trackingInfo}. Tap to track delivery.`,
      type: 'SHIPPING',
      orderId: order.id,
      orderNumber: orderNum,
      linkUrl: order.trackingUrl || `/track-order?orderNumber=${orderNum}`,
    });
  }

  if (status === 'delivered') {
    return createNotification({
      userId: order.userId,
      title: '🎉 Order Delivered',
      message: `Your Lunar package #${orderNum} has arrived! We hope you cherish your new pieces.`,
      type: 'SHIPPING',
      orderId: order.id,
      orderNumber: orderNum,
      linkUrl: `/track-order?orderNumber=${orderNum}`,
    });
  }

  if (status === 'processing') {
    return createNotification({
      userId: order.userId,
      title: '💎 Crafting Your Luxury Pieces',
      message: `Your order #${orderNum} is currently in preparation & quality inspection.`,
      type: 'ORDER',
      orderId: order.id,
      orderNumber: orderNum,
      linkUrl: `/track-order?orderNumber=${orderNum}`,
    });
  }

  if (status === 'cancelled') {
    return createNotification({
      userId: order.userId,
      title: 'ℹ️ Order Cancelled',
      message: `Your order #${orderNum} has been cancelled. Please contact customer care for details.`,
      type: 'ORDER',
      orderId: order.id,
      orderNumber: orderNum,
      linkUrl: `/track-order?orderNumber=${orderNum}`,
    });
  }

  if (status === 'paid' && previousStatus !== 'Paid') {
    return notifyPaymentConfirmed(order);
  }

  return null;
}

/**
 * Notify customer when they earn loyalty reward points
 */
export async function notifyLoyaltyPointsEarned(userId: string, points: number, orderNumber?: string) {
  if (!userId || points <= 0) return null;

  const orderSuffix = orderNumber ? ` for order #${orderNumber}` : '';
  return createNotification({
    userId,
    title: '✨ Club Points Awarded',
    message: `You earned +${points} Lunar Club Points${orderSuffix}!`,
    type: 'LOYALTY',
    orderNumber,
    linkUrl: '/account',
  });
}
