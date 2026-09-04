import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { getJwtSecret } from '../_lib/auth-util.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import crypto from 'crypto';

const FIREBASE_PROJECT_ID = 'lunar-store-ecef4';

async function verifyFirebaseToken(
  token: string
): Promise<{ email?: string; phone?: string; uid: string } | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      console.warn('Google/Firebase tokeninfo verification failed with status:', res.status);
      return null;
    }
    const data = await res.json();

    // Verify audience matches our Firebase Project
    if (data.aud !== FIREBASE_PROJECT_ID) {
      console.warn(`Firebase token audience mismatch. Expected ${FIREBASE_PROJECT_ID}, got:`, data.aud);
      return null;
    }

    return {
      email: data.email ? String(data.email).toLowerCase().trim() : undefined,
      phone: data.phone_number ? String(data.phone_number).trim() : undefined,
      uid: String(data.sub || data.user_id || ''),
    };
  } catch (err) {
    console.error('Error contacting token verification service:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate limiting: max 15 attempts per 15 min per IP
  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 15, keyPrefix: 'social-login' })) {
    return;
  }

  try {
    const { provider, email, phone, name, token } = req.body || {};

    if (!provider) {
      return res.status(400).json({ message: 'Provider is required' });
    }

    let verifiedEmail: string | null = null;
    let verifiedPhone: string | null = null;

    // Verify authentication token
    if (token) {
      const verified = await verifyFirebaseToken(token);
      if (verified) {
        verifiedEmail = verified.email || null;
        verifiedPhone = verified.phone || null;
      } else {
        return res.status(401).json({
          message: 'Invalid or unverified third-party authentication token. Please sign in again.',
        });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // Local development test without token
      if (email) verifiedEmail = String(email).trim().toLowerCase();
      if (phone) verifiedPhone = String(phone).trim();
    }

    // If still not verified, refuse login to prevent account takeover
    if (!verifiedEmail && !verifiedPhone) {
      return res.status(401).json({
        message: 'Invalid or unverified third-party authentication token. Please sign in again.',
      });
    }

    const cleanEmail = verifiedEmail || (verifiedPhone ? `${verifiedPhone.replace(/[^0-9]/g, '')}@phone.lunar.com` : null);
    if (!cleanEmail) {
      return res.status(400).json({ message: 'Could not determine verified account email.' });
    }

    let user = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(verifiedPhone ? [{ phone: verifiedPhone }] : []),
        ],
      },
    });

    // CRITICAL DEFENSE: Disallow social login takeover of ADMIN accounts!
    if (user && user.role === 'ADMIN') {
      return res.status(403).json({
        message: 'Administrator accounts cannot be accessed via social login. Please use the administrative login portal.',
      });
    }

    if (user) {
      const updateData: any = {};
      if (user.verificationToken !== null) {
        updateData.verificationToken = null;
      }
      if (verifiedPhone && !user.phone) {
        updateData.phone = verifiedPhone;
      }
      if (Object.keys(updateData).length > 0) {
        user = await (prisma as any).user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create user account for first-time social login
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await (prisma as any).user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          phone: verifiedPhone,
          name: name ? String(name).trim() : (provider === 'phone' ? `User ${verifiedPhone || ''}` : `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`),
          role: 'USER', // Always enforce USER role
          verificationToken: null, // Pre-verified by OAuth/SMS
        },
      });
    }

    const jwtSecret = getJwtSecret();
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'USER' },
      jwtSecret,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const cookie = serialize('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      message: 'Social login successful',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        street: user.street,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        phone: user.phone,
        role: user.role || 'USER',
        loyaltyPoints: user.loyaltyPoints || 0,
      },
    });
  } catch (error) {
    console.error('Social login error:', error);
    return res.status(500).json({ message: 'Authentication service temporarily unavailable. Please try again later.' });
  }
}
