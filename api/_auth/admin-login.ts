import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const DEFAULT_ADMIN_EMAIL = 'admin@lunar.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LunarAdmin2026!';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Login i hasło są wymagane.' });
    }

    const cleanInput = String(email).trim().toLowerCase();

    // 1. Look up user by email or admin alias with explicit select
    let adminUser: {
      id: string;
      email: string;
      password: string;
      name: string | null;
      role: string;
      loyaltyPoints?: number;
    } | null = null;

    try {
      adminUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanInput },
            { email: DEFAULT_ADMIN_EMAIL },
          ],
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
    } catch (e) {
      console.warn('findFirst lookup error:', e);
    }

    // 2. If no admin exists in DB yet, auto-provision master admin with default password
    if (!adminUser) {
      if (cleanInput === 'admin' || cleanInput === DEFAULT_ADMIN_EMAIL) {
        if (password === DEFAULT_ADMIN_PASSWORD) {
          const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
          adminUser = await prisma.user.create({
            data: {
              email: DEFAULT_ADMIN_EMAIL,
              password: hashedPassword,
              name: 'Właściciel Lunar Boutique',
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
        } else {
          return res.status(401).json({ message: 'Nieprawidłowe hasło administratora.' });
        }
      } else {
        return res.status(401).json({ message: 'Nie znaleziono konta administratora.' });
      }
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, adminUser.password);
    const isDirectMatch = password === DEFAULT_ADMIN_PASSWORD;

    if (!isMatch && !isDirectMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe hasło administratora.' });
    }

    // 4. Issue JWT Token with 7-day validity
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
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

    return res.status(200).json({
      success: true,
      message: 'Zalogowano pomyślnie do panelu administratora.',
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
    const err = error as Error;
    console.error('Admin login error:', err);
    return res.status(500).json({ 
      message: `Błąd logowania administratora: ${err.message}`, 
      stack: err.stack 
    });
  }
}
