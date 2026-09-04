import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface EmailTemplateData {
  [key: string]: string;
}

export async function sendEmail({
  to,
  subject,
  templateName,
  data,
}: {
  to: string;
  subject: string;
  templateName: 'welcome' | 'verify-account' | 'reset-password' | 'order-confirmation' | 'shipment-dispatched';
  data: EmailTemplateData;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[Resend] RESEND_API_KEY is not set. Simulation mode: Email to ${to} with subject "${subject}" was skipped.`);
    return { id: `simulated_${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    
    // Resolve email template file
    let templatePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(__dirname, '..', '..', 'email-templates', `${templateName}.html`);
    }
    
    let html = fs.readFileSync(templatePath, 'utf8');

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';

    // Default placeholders
    const defaults: Record<string, string> = {
      SHOP_URL: appUrl,
      PRIVACY_URL: `${appUrl}/terms`,
      UNSUBSCRIBE_URL: `${appUrl}/contact`,
      SUPPORT_EMAIL: 'contact@mylunar.shop',
    };

    // Merge provided data with defaults
    const fullData = { ...defaults, ...data };

    // Replace all {{KEY}} placeholders in HTML with escaped values (unless key ends with _HTML)
    Object.entries(fullData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const safeValue = key.endsWith('_HTML') || key.endsWith('_URL') ? String(value || '') : escapeHtml(value);
      html = html.replace(placeholder, safeValue);
    });

    const fromAddress = process.env.EMAIL_FROM || 'Lunar <noreply@mylunar.shop>';

    const { data: resData, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      throw new Error(error.message);
    }

    return resData;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function sendOrderConfirmationEmail(order: any, options?: { pointsEarned?: number }) {
  if (!order || !order.customerEmail) {
    console.warn('[Email] Cannot send order confirmation without valid customer email.');
    return;
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';
  const formatPrice = (amount: number | string) => {
    const num = Number(amount || 0);
    return `${num.toFixed(2)} €`;
  };

  // Format ordered items HTML
  const items = Array.isArray(order.items) ? order.items : [];
  const defaultPlaceholderImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400';

  const orderItemsHtml = items.map((item: any) => {
    let img = item.image || defaultPlaceholderImg;
    if (img && !img.startsWith('http')) {
      img = `${appUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    }
    const itemTotal = formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1));
    const optionText = item.selectedOptions 
      ? `<span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #8C6D4F; display: block; margin-top: 2px;">Option: ${item.selectedOptions}</span>` 
      : '';

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE6DF; width: 60px; vertical-align: top;">
          <img src="${img}" alt="${item.name || 'Product'}" width="50" height="50" style="border-radius: 4px; border: 1px solid #EDE6DF; object-fit: cover; display: block;" />
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #EDE6DF; vertical-align: top;">
          <strong style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1A1A1A; display: block; line-height: 18px;">${item.name || 'Lunar Creation'}</strong>
          ${optionText}
          <span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #78716C; display: block; margin-top: 2px;">${item.quantity || 1} &times; ${formatPrice(item.price || 0)}</span>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #EDE6DF; vertical-align: top; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #1A1A1A; white-space: nowrap;">
          ${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  // Discount row
  const discountAmount = Number(order.discountAmount || 0);
  const discountRowHtml = discountAmount > 0 ? `
    <tr>
      <td align="left" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #15803d; padding: 4px 0;">
        Discount ${order.discountCode ? `(${order.discountCode})` : ''}:
      </td>
      <td align="right" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #15803d; padding: 4px 0;">
        -${formatPrice(discountAmount)}
      </td>
    </tr>
  ` : '';

  // Loyalty Points banner
  const points = options?.pointsEarned || 0;
  const loyaltyBannerHtml = points > 0 ? `
    <div style="margin-top: 20px; background-color: #FAF6F3; border: 1px solid #EDE6DF; border-radius: 4px; padding: 14px 16px; text-align: center;">
      <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #8C6D4F; letter-spacing: 0.05em;">
        ✦ You earned +${points} points in the Lunar VIP Club!
      </span>
    </div>
  ` : '';

  // Payment label
  let paymentLabel = 'Processing';
  if (order.paymentStatus === 'paid' || order.status === 'Paid') {
    paymentLabel = 'Paid (Stripe / Card)';
  } else if (order.paymentMethod === 'demo') {
    paymentLabel = 'Paid (Simulation)';
  } else if (order.paymentMethod === 'transfer') {
    paymentLabel = 'Bank Transfer';
  }

  // Date formatting in English
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const orderUrl = order.stripeSessionId 
    ? `${appUrl}/order-success?session_id=${order.stripeSessionId}` 
    : `${appUrl}/account/orders`;

  const phoneRow = order.shippingPhone 
    ? `Phone: ${order.shippingPhone}` 
    : '';

  return await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.orderNumber} — Lunar`,
    templateName: 'order-confirmation',
    data: {
      CUSTOMER_NAME: order.customerName || 'Valued Client',
      ORDER_NUMBER: order.orderNumber || 'LUNAR-ORD',
      ORDER_DATE: orderDate,
      PAYMENT_STATUS_LABEL: paymentLabel,
      ORDER_ITEMS_HTML: orderItemsHtml || '<tr><td colspan="3" style="padding: 10px 0; color: #78716C;">No items</td></tr>',
      SUBTOTAL: formatPrice(order.subtotal || order.total || 0),
      DISCOUNT_ROW_HTML: discountRowHtml,
      SHIPPING_FEE: Number(order.shippingFee || 0) === 0 ? 'Complimentary' : formatPrice(order.shippingFee),
      TOTAL: formatPrice(order.total || 0),
      LOYALTY_BANNER_HTML: loyaltyBannerHtml,
      SHIPPING_NAME: order.customerName || '',
      SHIPPING_STREET: order.shippingStreet || '',
      SHIPPING_POSTAL_CODE: order.shippingPostalCode || '',
      SHIPPING_CITY: order.shippingCity || '',
      SHIPPING_COUNTRY: order.shippingCountry || 'Ireland',
      SHIPPING_PHONE_ROW: phoneRow,
      ORDER_URL: orderUrl,
    },
  });
}

export async function sendShipmentNotificationEmail(order: any) {
  if (!order || !order.customerEmail) {
    console.warn('[Email] Cannot send shipment notification without valid customer email.');
    return;
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';

  const dispatchDate = new Date(order.shippedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const carrierShortName = order.carrierName ? order.carrierName.replace(/\s*\(.*?\)/g, '') : 'Courier';
  const shopTrackUrl = `${appUrl}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}`;

  return await sendEmail({
    to: order.customerEmail,
    subject: `Your Lunar Order #${order.orderNumber} Has Been Dispatched (${carrierShortName})`,
    templateName: 'shipment-dispatched',
    data: {
      CUSTOMER_NAME: order.customerName || 'Valued Client',
      ORDER_NUMBER: order.orderNumber || 'LUNAR-ORD',
      CARRIER_NAME: order.carrierName || 'Courier Partner',
      CARRIER_SHORT_NAME: carrierShortName,
      TRACKING_NUMBER: order.trackingNumber || 'Tracking Pending',
      ESTIMATED_DELIVERY: order.estimatedDelivery || '1–3 Business Days',
      TRACKING_URL: order.trackingUrl || shopTrackUrl,
      SHOP_TRACK_URL: shopTrackUrl,
      DISPATCH_DATE: dispatchDate,
      SHIPPING_NAME: order.customerName || '',
      SHIPPING_STREET: order.shippingStreet || '',
      SHIPPING_POSTAL_CODE: order.shippingPostalCode || '',
      SHIPPING_CITY: order.shippingCity || '',
      SHIPPING_COUNTRY: order.shippingCountry || 'Ireland',
      CURRENT_YEAR: String(new Date().getFullYear()),
    },
  });
}

export async function sendCustomNotificationEmail({
  to,
  recipientName,
  title,
  message,
  orderNumber,
  linkUrl,
}: {
  to: string;
  recipientName?: string;
  title: string;
  message: string;
  orderNumber?: string;
  linkUrl?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[Resend] RESEND_API_KEY is not set. Simulation mode: Email to ${to} with title "${title}" was skipped.`);
    return { id: `simulated_${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop').replace(/\/$/, '');

    // Determine intelligent tracking or action link
    let targetLink = linkUrl ? String(linkUrl).trim() : '';
    const cleanOrderNum = orderNumber ? String(orderNumber).trim().toUpperCase() : null;

    if (!targetLink) {
      if (cleanOrderNum) {
        targetLink = `/track-order?orderNumber=${encodeURIComponent(cleanOrderNum)}&email=${encodeURIComponent(to)}`;
      } else {
        targetLink = '/track-order';
      }
    } else if (cleanOrderNum && targetLink.startsWith('/track-order') && !targetLink.includes('orderNumber=')) {
      const sep = targetLink.includes('?') ? '&' : '?';
      targetLink = `${targetLink}${sep}orderNumber=${encodeURIComponent(cleanOrderNum)}&email=${encodeURIComponent(to)}`;
    }

    const fullLink = targetLink.startsWith('http')
      ? targetLink
      : `${appUrl}${targetLink.startsWith('/') ? '' : '/'}${targetLink}`;

    const isTracking = Boolean(cleanOrderNum || targetLink.includes('/track'));
    const buttonLabel = isTracking
      ? 'TRACK YOUR ORDER'
      : targetLink.includes('/shop')
      ? 'EXPLORE THE BOUTIQUE'
      : targetLink.includes('/account')
      ? 'VIEW YOUR ACCOUNT'
      : 'VIEW DETAILS / TRACK ORDER';

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>${title}</title></head>
      <body style="font-family: 'Inter', -apple-system, sans-serif; background-color: #FAF8F5; margin: 0; padding: 30px 15px; color: #1A1A1A;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #EDE6DF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <div style="background-color: #1A1A1A; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #D4AF37; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; letter-spacing: 4px;">L U N A R</h1>
          </div>
          <div style="padding: 32px 28px;">
            ${recipientName ? `<p style="font-size: 13px; color: #8C827A; margin-top: 0; margin-bottom: 8px;">Hello ${recipientName},</p>` : ''}
            <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: #1A1A1A; margin-top: 0; line-height: 1.3;">${title}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; white-space: pre-line;">${message}</p>
            ${orderNumber ? `<div style="margin: 18px 0; padding: 12px 16px; background: #FAF6F3; border-left: 3px solid #D4AF37; font-size: 13px; font-weight: 600; color: #1A1A1A;">Order Reference: #${orderNumber}</div>` : ''}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${fullLink}" style="display: inline-block; background-color: #1A1A1A; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px;">${buttonLabel}</a>
            </div>
          </div>
          <div style="background-color: #FAF8F5; border-top: 1px solid #EDE6DF; padding: 18px 24px; text-align: center; font-size: 11px; color: #8C827A;">
            Lunar Atelier • Haute Joaillerie & Perfumery<br/>
            Need assistance? Contact us at <a href="mailto:contact@mylunar.shop" style="color: #8C6D4F;">contact@mylunar.shop</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.EMAIL_FROM || 'Lunar <noreply@mylunar.shop>';
    const resData = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: title,
      html,
    });
    return resData;
  } catch (error) {
    console.error('Custom notification email error:', error);
    return null;
  }
}

