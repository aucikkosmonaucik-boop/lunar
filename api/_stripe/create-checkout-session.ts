import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  const { items, customerEmail, discountCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Shopping cart is empty' });
  }

  // Extract logged-in user if token is present
  let userId: string | null = null;
  let userEmail: string | null = customerEmail || null;

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
    // Guest checkout allowed
  }

  // Calculate items total
  const itemsTotal = items.reduce((sum: number, item: CartItem) => {
    return sum + (Number(item.product.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  const isFreeShipping = itemsTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : 10;

  // Determine origin URL for redirect
  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || process.env.APP_URL || 'http://localhost:5173';

  // Check if Stripe key is configured
  if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key') || stripeSecretKey.length < 10) {
    // If Stripe key is not configured, provide helpful guidance and mock success option
    console.warn('STRIPE_SECRET_KEY is missing or unconfigured in .env');
    return res.status(200).json({
      demoMode: true,
      message: 'STRIPE_SECRET_KEY not yet configured in .env. You can add it anytime for live Stripe payments.',
      mockSessionId: `mock_sess_${Date.now()}`,
      url: `${origin}/order-success?session_id=mock_session_${Date.now()}&demo=true`,
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);

    // Build Stripe Line Items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: CartItem) => {
      // Validate image URL (Stripe requires absolute HTTPS URL)
      let imageUrl = item.product.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      const validImages = imageUrl && imageUrl.startsWith('http') ? [imageUrl] : undefined;

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
          unit_amount: Math.round(Number(item.product.price) * 100), // Stripe uses cents
        },
        quantity: Math.max(1, Number(item.quantity) || 1),
      };
    });

    // Shipping configuration
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

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: [
          'IE', 'GB', 'PL', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT',
          'US', 'CA', 'AU', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'CZ', 'SK', 'HU'
        ],
      },
      shipping_options: shippingOptions,
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        userId: userId || 'guest',
        itemsCount: String(items.length),
        totalItemsCount: String(items.reduce((s: number, i: CartItem) => s + i.quantity, 0)),
        discountCode: discountCode || '',
        itemsSummary: JSON.stringify(
          items.map((i: CartItem) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            qty: i.quantity,
          }))
        ).slice(0, 480),
      },
    };

    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      demoMode: false,
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
