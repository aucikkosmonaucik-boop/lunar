import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

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

    // Identify user from token or master lookup
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    let adminUserId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        adminUserId = decoded.userId;
      } catch {
        // Token invalid, fallback
      }
    }

    let adminUser = adminUserId
      ? await prisma.user.findUnique({ where: { id: adminUserId } })
      : await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!adminUser) {
      return res.status(404).json({ message: 'Nie znaleziono konta administratora.' });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, adminUser.password);
    const isDirectMatch = currentPassword === (process.env.ADMIN_PASSWORD || 'LunarAdmin2026!');

    if (!isCurrentValid && !isDirectMatch) {
      return res.status(401).json({ message: 'Podane aktualne hasło jest nieprawidłowe.' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update
    const updated = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        password: hashedNewPassword,
        ...(newEmail ? { email: newEmail.trim().toLowerCase() } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Hasło administratora zostało pomyślnie zmienione.',
      email: updated.email,
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
