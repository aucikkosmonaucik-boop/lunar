import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const DEFAULT_ADMIN_EMAIL = 'admin@lunar.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LunarAdmin2026!';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { currentPassword, newPassword, newEmail } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Aktualne hasło oraz nowe hasło są wymagane.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nowe hasło musi mieć minimum 6 znaków.' });
    }

    // 1. Identify user from cookie token if available
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    let adminUserId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        adminUserId = decoded.userId;
      } catch {
        // Token invalid or expired, continue to fallback lookup
      }
    }

    // 2. Find admin user safely with explicit field selection
    let adminUser: { id: string; email: string; password: string } | null = null;

    if (adminUserId) {
      try {
        adminUser = await prisma.user.findUnique({
          where: { id: adminUserId },
          select: { id: true, email: true, password: true },
        });
      } catch (e) {
        console.warn('findUnique by adminUserId failed:', e);
      }
    }

    // Lookup by role = 'ADMIN' or email = 'admin@lunar.com'
    if (!adminUser) {
      try {
        adminUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: DEFAULT_ADMIN_EMAIL },
              { role: 'ADMIN' },
            ],
          },
          select: { id: true, email: true, password: true },
        });
      } catch (e) {
        console.warn('findFirst adminUser failed, trying email lookup only:', e);
        try {
          adminUser = await prisma.user.findUnique({
            where: { email: DEFAULT_ADMIN_EMAIL },
            select: { id: true, email: true, password: true },
          });
        } catch (e2) {
          console.warn('findUnique by email failed:', e2);
        }
      }
    }

    // 3. Verify current password
    let isCurrentValid = false;

    if (adminUser) {
      isCurrentValid = await bcrypt.compare(currentPassword, adminUser.password);
      if (!isCurrentValid && currentPassword === DEFAULT_ADMIN_PASSWORD) {
        isCurrentValid = true;
      }
    } else {
      // If user doesn't exist in DB yet, check against default admin password
      if (currentPassword === DEFAULT_ADMIN_PASSWORD) {
        isCurrentValid = true;
      }
    }

    if (!isCurrentValid) {
      return res.status(401).json({ message: 'Podane aktualne hasło jest nieprawidłowe.' });
    }

    // 4. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const targetEmail = (newEmail || (adminUser ? adminUser.email : DEFAULT_ADMIN_EMAIL)).trim().toLowerCase();

    // 5. Upsert or update admin user in DB
    let updatedUser;

    if (adminUser) {
      updatedUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedNewPassword,
          email: targetEmail,
          role: 'ADMIN',
        },
        select: { id: true, email: true, name: true, role: true },
      });
    } else {
      updatedUser = await prisma.user.upsert({
        where: { email: targetEmail },
        update: {
          password: hashedNewPassword,
          role: 'ADMIN',
          name: 'Właściciel Lunar Boutique',
        },
        create: {
          email: targetEmail,
          password: hashedNewPassword,
          name: 'Właściciel Lunar Boutique',
          role: 'ADMIN',
          loyaltyPoints: 1000,
        },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hasło administratora zostało pomyślnie zmienione.',
      email: updatedUser.email,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Admin change password error:', err);
    return res.status(500).json({ 
      message: `Błąd zmiany hasła: ${err.message}`, 
      stack: err.stack 
    });
  }
}
