import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { getJwtSecret } from '../_lib/auth-util.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const DEFAULT_ADMIN_EMAIL = 'admin@lunar.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 5 attempts per 15 minutes to block brute-force attacks
  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'admin-login' })) {
    return;
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    const cleanInput = String(email).trim().toLowerCase();
    const targetEmail = cleanInput === 'admin' ? DEFAULT_ADMIN_EMAIL : cleanInput;

    // 1. Look up administrator in database
    let adminUser = await (prisma as any).user.findFirst({
      where: {
        email: targetEmail,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        loyaltyPoints: true,
      },
    });

    // 2. If no admin exists in DB yet, auto-provision master admin with configured ADMIN_PASSWORD
    if (!adminUser && (cleanInput === 'admin' || cleanInput === DEFAULT_ADMIN_EMAIL)) {
      const configuredAdminPassword = process.env.ADMIN_PASSWORD;
      if (configuredAdminPassword && password === configuredAdminPassword) {
        const hashedPassword = await bcrypt.hash(configuredAdminPassword, 12);
        adminUser = await (prisma as any).user.create({
          data: {
            email: DEFAULT_ADMIN_EMAIL,
            password: hashedPassword,
            name: 'Lunar Boutique Owner',
            role: 'ADMIN',
            loyaltyPoints: 1000,
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            loyaltyPoints: true,
          },
        });
      }
    }

    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    // 3. Verify password hash using bcrypt
    const isMatch = await bcrypt.compare(String(password), adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    // 4. Issue JWT Token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully to the owner dashboard.',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'ADMIN',
        loyaltyPoints: adminUser.loyaltyPoints || 0,
      },
      adminToken: token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      message: 'Internal server error occurred during administrator authentication.' 
    });
  }
}
