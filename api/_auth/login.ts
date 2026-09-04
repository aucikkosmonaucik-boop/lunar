import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { getJwtSecret } from '../_lib/auth-util.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 10 attempts per 15 min per IP to prevent brute force
  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'login' })) {
    return;
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await (prisma as any).user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login if email is not verified yet
    if (user.verificationToken !== null) {
      return res.status(403).json({
        message: 'Your email address is not verified yet. Please check your inbox and click the verification link.',
        unverified: true,
        email: user.email,
      });
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'USER' },
      jwtSecret,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Authentication service temporarily unavailable. Please try again later.' });
  }
}
