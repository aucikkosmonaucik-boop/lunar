import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  let userId: string | null = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      // Guest order
    }
  }

  try {
    const {
      items,
      total,
      subtotal,
      discountCode,
      discountAmount,
      shippingFee,
      paymentMethod,
      orderNotes,
      shippingAddress,
    } = req.body;

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

    const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerEmail: shippingAddress.email.trim(),
        customerName: shippingAddress.name.trim(),
        shippingPhone: shippingAddress.phone || null,
        shippingStreet: shippingAddress.street.trim(),
        shippingCity: shippingAddress.city?.trim() || '',
        shippingPostalCode: shippingAddress.postalCode?.trim() || '',
        shippingCountry: shippingAddress.country?.trim() || 'PL',
        orderNotes: orderNotes || null,
        subtotal: subtotal ? Number(subtotal) : Number(total),
        discountCode: discountCode || null,
        discountAmount: discountAmount ? Number(discountAmount) : 0,
        shippingFee: shippingFee !== undefined ? Number(shippingFee) : 0,
        total: Number(total),
        status: 'Processing',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'card',
        items: {
          create: items.map((item: CartItem) => ({
            productId: item.product?.id || null,
            name: item.product?.name || 'Item',
            price: Number(item.product?.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.product?.image || '',
            selectedOptions: item.selectedOptions || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Order Creation Error:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
}
