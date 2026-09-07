import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import bcrypt from 'bcryptjs';
import { prisma } from '../_lib/prisma.js';
import { getJwtSecret } from '../_lib/auth-util.js';
import { getBackendCarrier } from '../_lib/carriers.js';

const FREE_SHIPPING_THRESHOLD = 50;

interface CartItem {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    category?: string;
  };
  quantity: number;
  selectedOptions?: string;
}

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface AccountOption {
  createAccount?: boolean;
  password?: string;
  saveAddressToProfile?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(500).json({ message: 'Stripe secret key is not configured on the server.' });
  }

  const {
    items,
    customerEmail,
    discountCode,
    shippingAddress,
    accountOption,
    carrier,
    carrierName,
    estimatedDelivery,
  } = req.body as {
    items: CartItem[];
    customerEmail?: string;
    discountCode?: string;
    shippingAddress?: ShippingAddress;
    accountOption?: AccountOption;
    carrier?: string;
    carrierName?: string;
    estimatedDelivery?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Shopping cart is empty' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ message: 'A shipping address is required.' });
  }

  const requiredFields: (keyof ShippingAddress)[] = ['name', 'email', 'phone', 'street', 'city', 'postalCode', 'country'];
  const missingFields = requiredFields.filter((field) => !shippingAddress[field] || !String(shippingAddress[field]).trim());

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'All shipping address fields are required (Name, Email, Phone, Street, City, Postal Code, Country).',
      missingFields,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(shippingAddress.email.trim())) {
    return res.status(400).json({ message: 'Invalid email address provided.' });
  }

  // 1. Identify or create user if requested
  let userId: string | null = null;
  let createdUser: any = null;

  try {
    const cookies = parse(req.headers.cookie || '');
    const authHeader = req.headers.authorization;
    let token = cookies.auth_token;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, getJwtSecret()) as { userId?: string; id?: string };
        userId = decoded.userId || decoded.id || null;
      } catch {
        // Invalid or expired token
      }
    }
  } catch {
    // Ignore cookie parse error
  }

  if (!userId && accountOption?.createAccount && accountOption.password) {
    try {
      const existing = await (prisma as any).user.findUnique({
        where: { email: shippingAddress.email.trim().toLowerCase() },
      });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(accountOption.password, 10);
        createdUser = await (prisma as any).user.create({
          data: {
            email: shippingAddress.email.trim().toLowerCase(),
            password: hashedPassword,
            name: shippingAddress.name.trim(),
            phone: shippingAddress.phone.trim(),
            street: shippingAddress.street.trim(),
            city: shippingAddress.city.trim(),
            postalCode: shippingAddress.postalCode.trim(),
            country: shippingAddress.country.trim(),
            role: 'USER',
            isVerified: true,
          },
        });
        userId = createdUser.id;
      } else {
        userId = existing.id;
      }
    } catch (err) {
      console.error('Auto user creation during PaymentIntent error:', err);
    }
  }

  // 2. Fetch products and verify prices on the server side
  const productIds = items
    .map((it: CartItem) => it.product?.id)
    .filter((id: any) => typeof id === 'string');

  const dbProducts = await (prisma as any).product.findMany({
    where: { id: { in: productIds } },
  });
  const dbProductMap = new Map<string, any>();
  dbProducts.forEach((p: any) => dbProductMap.set(p.id, p));

  let itemsTotal = 0;
  const verifiedItems = items.map((item: CartItem) => {
    const pId = item.product?.id;
    const dbProduct = pId ? dbProductMap.get(pId) : null;
    const verifiedPrice = dbProduct ? Number(dbProduct.price) : Math.max(0, Number(item.product?.price || 0));
    const verifiedQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
    itemsTotal += verifiedPrice * verifiedQty;

    return {
      productId: dbProduct ? dbProduct.id : (pId || null),
      name: dbProduct ? dbProduct.name : (item.product?.name || 'Item'),
      price: verifiedPrice,
      quantity: verifiedQty,
      image: dbProduct ? dbProduct.image : (item.product?.image || ''),
      selectedOptions: item.selectedOptions ? String(item.selectedOptions).slice(0, 100) : null,
    };
  });

  // 3. Verify Promo Code
  let discountPct = 0;
  let discountAmount = 0;
  let normalizedPromo: string | null = null;

  if (discountCode) {
    try {
      normalizedPromo = String(discountCode).toUpperCase().trim();
      const promo = await (prisma as any).promoCode.findUnique({
        where: { code: normalizedPromo },
      });
      if (promo && promo.isActive) {
        discountPct = promo.discountPct || 0;
        discountAmount = (itemsTotal * discountPct) / 100;
      } else {
        const userCoupon = await (prisma as any).userCoupon.findUnique({
          where: { code: normalizedPromo },
        });
        if (userCoupon && !userCoupon.isUsed) {
          if (userCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (itemsTotal * userCoupon.discountValue) / 100;
          } else {
            discountAmount = Math.min(itemsTotal, userCoupon.discountValue);
          }
        }
      }
    } catch (promoErr) {
      console.error('Promo code calculation error:', promoErr);
    }
  }

  const chosenCarrierCode = carrier || 'AN_POST';
  const backendCarrier = getBackendCarrier(chosenCarrierCode);
  const chosenCarrierName = carrierName || backendCarrier.name;
  const chosenEstDelivery = estimatedDelivery || backendCarrier.estimatedDelivery;

  const priceAfterDiscount = Math.max(0, itemsTotal - discountAmount);
  const isFreeShipping = backendCarrier.freeShippingAvailable && priceAfterDiscount >= backendCarrier.freeThreshold;
  const shippingFee = isFreeShipping ? 0 : backendCarrier.basePrice;
  const finalTotal = Number((priceAfterDiscount + shippingFee).toFixed(2));
  const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    // 4. Pre-create Order in Postgres with status Pending
    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerEmail: shippingAddress.email.trim().toLowerCase(),
        customerName: shippingAddress.name.trim(),
        shippingPhone: shippingAddress.phone.trim(),
        shippingStreet: shippingAddress.street.trim(),
        shippingCity: shippingAddress.city.trim(),
        shippingPostalCode: shippingAddress.postalCode.trim(),
        shippingCountry: shippingAddress.country.trim(),
        carrier: chosenCarrierCode,
        carrierName: chosenCarrierName,
        estimatedDelivery: chosenEstDelivery,
        subtotal: itemsTotal,
        discountCode: normalizedPromo,
        discountAmount,
        shippingFee,
        total: finalTotal,
        status: 'Pending',
        paymentStatus: 'pending',
        paymentMethod: 'stripe_payment_intent',
        items: {
          create: verifiedItems,
        },
      },
      include: { items: true },
    });

    // 5. Create Stripe PaymentIntent
    const stripe = new Stripe(stripeSecretKey);
    const amountInCents = Math.round(finalTotal * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: String(order.id),
        orderNumber: String(order.orderNumber),
        customerEmail: shippingAddress.email.trim(),
        customerName: shippingAddress.name.trim(),
      },
      receipt_email: shippingAddress.email.trim(),
      description: `LUNAR Order ${order.orderNumber}`,
    });

    // Update order with payment intent ID
    await (prisma as any).order.update({
      where: { id: order.id },
      data: { stripeSessionId: paymentIntent.id },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber: order.orderNumber,
      orderId: order.id,
      amount: finalTotal,
      currency: 'EUR',
      user: createdUser,
    });
  } catch (stripeError: any) {
    console.error('Stripe PaymentIntent creation failed:', stripeError);
    return res.status(500).json({
      message: stripeError?.message || 'Failed to create payment intent with Stripe.',
    });
  }
}
