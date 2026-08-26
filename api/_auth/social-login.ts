import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { provider, email, phone, name, providerId, token } = req.body;

    if (!provider) {
      return res.status(400).json({ message: 'Provider is required' });
    }

    const cleanPhone = phone ? phone.trim() : null;
    const cleanEmail = email
      ? email.trim().toLowerCase()
      : cleanPhone
        ? `${cleanPhone.replace(/[^0-9]/g, '')}@phone.lunar.com`
        : null;

    if (!cleanEmail) {
      return res.status(400).json({ message: 'Email or phone number is required for authentication' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (user) {
      // If user exists and email was not verified before, verify it now since providers guarantee ownership
      const updateData: any = {};
      if (user.verificationToken !== null) {
        updateData.verificationToken = null;
      }
      if (cleanPhone && !user.phone) {
        updateData.phone = cleanPhone;
      }
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create a new user account for first-time social/phone login
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          phone: cleanPhone,
          name: name ? name.trim() : (provider === 'phone' ? `User ${cleanPhone || ''}` : `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`),
          verificationToken: null, // Pre-verified via SMS/OAuth
        },
      });
    }

    const authToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookie = serialize('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
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
        street: (user as any).street,
        city: (user as any).city,
        postalCode: (user as any).postalCode,
        country: (user as any).country,
        phone: (user as any).phone,
        role: (user as any).role || 'USER',
        loyaltyPoints: (user as any).loyaltyPoints || 0,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Social login error:', err);
    return res.status(500).json({ message: `Prisma/Vercel Error: ${err.message}`, stack: err.stack });
  }
}
