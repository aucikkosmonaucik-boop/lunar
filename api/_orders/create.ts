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
    const { items, total, shippingAddress } = req.body;

    interface CartItem {
      product: {
        id: string;
        name: string;
        price: number;
        image: string;
      };
      quantity: number;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Wymagany jest adres wysyłki' });
    }

    const order = await (prisma as any).order.create({
      data: {
        userId: userId || null,
        customerEmail: shippingAddress.email || null,
        customerName: shippingAddress.name || null,
        shippingPhone: shippingAddress.phone || null,
        shippingStreet: shippingAddress.street || null,
        shippingCity: shippingAddress.city || null,
        shippingPostalCode: shippingAddress.postalCode || null,
        shippingCountry: shippingAddress.country || null,
        total: Number(total),
        status: 'Processing',
        items: {
          create: items.map((item: CartItem) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
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
      error: err.message
    });
  }
}
