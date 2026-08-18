import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import { prisma } from '../_lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
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

  const { items, customerEmail, discountCode, shippingAddress, accountOption } = req.body as {
    items: CartItem[];
    customerEmail?: string;
    discountCode?: string;
    shippingAddress?: ShippingAddress;
    accountOption?: AccountOption;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Shopping cart is empty' });
  }

  // 1. Mandatory Shipping Address Validation (Guarantees we know who and where to ship to!)
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

  // 2. Extract logged-in user if token is present (otherwise Guest Checkout with userId = null)
  let userId: string | null = null;
  let userEmail: string | null = shippingAddress.email.trim() || customerEmail || null;
  let createdUser: any = null;

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string };
      userId = decoded.userId;
      if (decoded.email && !userEmail) {
        userEmail = decoded.email;
      }
    }
  } catch {
    // Guest checkout allowed - userId remains null
  }

  // 3. Handle Account Creation Option (if guest opted to create an account during checkout)
  if (!userId && accountOption?.createAccount) {
    const rawPassword = accountOption.password || '';
    if (rawPassword.length < 6) {
      return res.status(400).json({ message: 'Account password must be at least 6 characters.' });
    }

    try {
      const existingUser = await (prisma as any).user.findUnique({
        where: { email: shippingAddress.email.toLowerCase().trim() },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'An account with this email already exists. Please sign in or continue as a guest.',
          code: 'USER_EXISTS',
        });
      }

      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const newUser = await (prisma as any).user.create({
        data: {
          email: shippingAddress.email.toLowerCase().trim(),
          password: hashedPassword,
          name: shippingAddress.name.trim(),
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim(),
          phone: shippingAddress.phone.trim(),
        },
      });

      userId = newUser.id;
      userEmail = newUser.email;
      createdUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        street: newUser.street,
        city: newUser.city,
        postalCode: newUser.postalCode,
        country: newUser.country,
        phone: newUser.phone,
      };

      // Generate login cookie
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const cookie = serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      res.setHeader('Set-Cookie', cookie);
    } catch (err: unknown) {
      console.error('Account creation during checkout error:', err);
      return res.status(500).json({ message: 'Error creating account: ' + (err as Error).message });
    }
  } else if (userId && accountOption?.saveAddressToProfile) {
    // If user is already logged in and requested to update saved profile address
    try {
      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          name: shippingAddress.name.trim(),
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim(),
          phone: shippingAddress.phone.trim(),
        },
      });
    } catch (err) {
      console.error('Failed to update user address profile:', err);
    }
  }

  // 4. Calculate Subtotal, Discounts, Shipping Fee, and Total
  const itemsTotal = items.reduce((sum: number, item: CartItem) => {
    return sum + (Number(item.product.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  let discountPct = 0;
  let discountAmount = 0;

  if (discountCode) {
    try {
      const promo = await (prisma as any).promoCode.findUnique({
        where: { code: discountCode.toUpperCase().trim() },
      });
      if (promo && promo.isActive) {
        discountPct = promo.discountPct || 0;
        discountAmount = (itemsTotal * discountPct) / 100;
      }
    } catch (promoErr) {
      console.error('Error verifying promo code:', promoErr);
    }
  }

  const priceAfterDiscount = Math.max(0, itemsTotal - discountAmount);
  const isFreeShipping = priceAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : 10;
  const finalTotal = priceAfterDiscount + shippingFee;

  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || process.env.APP_URL || 'http://localhost:5173';
  const orderNumber = `LUNAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  // 5. Handle Demo Mode (when Stripe secret key is not configured or in testing)
  if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key') || stripeSecretKey.length < 10) {
    console.warn('STRIPE_SECRET_KEY is missing or unconfigured in .env. Running in Demo Simulation mode.');
    const mockSessionId = `mock_session_${Date.now()}`;

    // ALWAYS save Guest / User Order in Postgres Database!
    try {
      await (prisma as any).order.create({
        data: {
          orderNumber,
          userId: userId || null, // null for Guest checkout
          customerEmail: shippingAddress.email.trim(),
          customerName: shippingAddress.name.trim(),
          shippingPhone: shippingAddress.phone.trim(),
          shippingStreet: shippingAddress.street.trim(),
          shippingCity: shippingAddress.city.trim(),
          shippingPostalCode: shippingAddress.postalCode.trim(),
          shippingCountry: shippingAddress.country.trim(),
          subtotal: itemsTotal,
          discountCode: discountCode || null,
          discountAmount,
          shippingFee,
          total: finalTotal,
          status: 'Paid',
          paymentStatus: 'paid',
          paymentMethod: 'demo',
          stripeSessionId: mockSessionId,
          items: {
            create: items.map((item: CartItem) => ({
              productId: String(item.product.id),
              name: String(item.product.name),
              price: Number(item.product.price),
              quantity: Number(item.quantity || 1),
              image: String(item.product.image || ''),
              selectedOptions: item.selectedOptions || null,
            })),
          },
        },
      });
      console.log(`✅ [Demo Guest/User Checkout] Order ${orderNumber} with shipping address saved to PostgreSQL.`);
    } catch (dbErr) {
      console.error('Error saving demo order to Postgres:', dbErr);
    }

    const encodedAddress = encodeURIComponent(JSON.stringify(shippingAddress));
    return res.status(200).json({
      demoMode: true,
      message: 'Checkout completed (Demo Simulation mode). Order and shipping address saved in database.',
      mockSessionId,
      url: `${origin}/order-success?session_id=${mockSessionId}&demo=true&address=${encodedAddress}`,
      user: createdUser,
    });
  }

  // 6. Live Stripe Checkout Session Creation
  try {
    const stripe = new Stripe(stripeSecretKey);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: CartItem) => {
      let imageUrl = item.product.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      const validImages = imageUrl && imageUrl.startsWith('http') ? [imageUrl] : undefined;

      const unitPrice = discountPct > 0 
        ? Math.round(Number(item.product.price) * (1 - discountPct / 100) * 100) 
        : Math.round(Number(item.product.price) * 100);

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product.name,
            description: item.product.description?.slice(0, 200) || `${item.product.category || 'Jewelry'} by Lunar`,
            images: validImages,
            metadata: {
              productId: String(item.product.id),
            },
          },
          unit_amount: unitPrice,
        },
        quantity: Math.max(1, Number(item.quantity) || 1),
      };
    });

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: isFreeShipping ? 0 : 1000,
            currency: 'eur',
          },
          display_name: isFreeShipping ? 'Free Insured Luxury Delivery' : 'Standard Insured Delivery',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 4 },
          },
        },
      },
    ];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      shipping_options: shippingOptions,
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        orderNumber,
        userId: userId || 'guest',
        customerEmail: shippingAddress.email.trim(),
        customerName: shippingAddress.name.trim(),
        shippingPhone: shippingAddress.phone.trim(),
        shippingStreet: shippingAddress.street.trim(),
        shippingCity: shippingAddress.city.trim(),
        shippingPostalCode: shippingAddress.postalCode.trim(),
        shippingCountry: shippingAddress.country.trim(),
        subtotal: String(itemsTotal),
        discountCode: discountCode || '',
        discountAmount: String(discountAmount),
        shippingFee: String(shippingFee),
        total: String(finalTotal),
        itemsSummary: JSON.stringify(
          items.map((i: CartItem) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            qty: i.quantity,
            image: i.product.image,
          }))
        ).slice(0, 480),
      },
    };

    if (shippingAddress.email) {
      sessionParams.customer_email = shippingAddress.email.trim();
    } else if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Save pending guest/user order to Postgres immediately with all shipping details
    try {
      await (prisma as any).order.create({
        data: {
          orderNumber,
          userId: userId || null, // null for Guest checkout
          customerEmail: shippingAddress.email.trim(),
          customerName: shippingAddress.name.trim(),
          shippingPhone: shippingAddress.phone.trim(),
          shippingStreet: shippingAddress.street.trim(),
          shippingCity: shippingAddress.city.trim(),
          shippingPostalCode: shippingAddress.postalCode.trim(),
          shippingCountry: shippingAddress.country.trim(),
          subtotal: itemsTotal,
          discountCode: discountCode || null,
          discountAmount,
          shippingFee,
          total: finalTotal,
          status: 'Processing',
          paymentStatus: 'pending',
          paymentMethod: 'stripe',
          stripeSessionId: session.id,
          items: {
            create: items.map((item: CartItem) => ({
              productId: String(item.product.id),
              name: String(item.product.name),
              price: Number(item.product.price),
              quantity: Number(item.quantity || 1),
              image: String(item.product.image || ''),
              selectedOptions: item.selectedOptions || null,
            })),
          },
        },
      });
      console.log(`✅ [Stripe Guest/User Checkout] Order ${orderNumber} created in PostgreSQL with full shipping address.`);
    } catch (dbErr) {
      console.error('Error pre-creating order in PostgreSQL:', dbErr);
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      demoMode: false,
      user: createdUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Stripe Checkout Session Error:', err);
    return res.status(500).json({
      message: 'Unable to initiate Stripe checkout',
      error: err.message,
    });
  }
}
