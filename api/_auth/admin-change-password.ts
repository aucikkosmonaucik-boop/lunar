import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken, getJwtSecret } from '../_lib/auth-util.js';
import { applyRateLimit } from '../_lib/rate-limit.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 5 attempts per 15 min per IP
  if (applyRateLimit(req, res, { windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'admin-chg-pwd' })) {
    return;
  }

  try {
    const { currentPassword, newPassword, newEmail } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // 1. Identify user from token (Bearer header or auth cookie)
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. You must be signed in as administrator.' });
    }

    let adminUserId: string | null = null;
    const jwtSecret = getJwtSecret();

    try {
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as { userId: string; role?: string };
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ message: 'Invalid administrative session token.' });
      }
      adminUserId = decoded.userId;
    } catch {
      return res.status(401).json({ message: 'Expired or invalid administrator session. Please sign in again.' });
    }

    // 2. Load admin user from database
    const adminUser = await (prisma as any).user.findUnique({
      where: { id: adminUserId },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Account is not an administrator.' });
    }

    // 3. Verify current password
    const isCurrentValid = await bcrypt.compare(String(currentPassword), adminUser.password);
    if (!isCurrentValid) {
      return res.status(401).json({ message: 'Current master password provided is incorrect.' });
    }

    // 4. Hash new password with bcrypt salt rounds 12
    const hashedNewPassword = await bcrypt.hash(String(newPassword), 12);
    const targetEmail = newEmail ? String(newEmail).trim().toLowerCase() : adminUser.email;

    // 5. Update admin credentials
    const updatedUser = await (prisma as any).user.update({
      where: { id: adminUser.id },
      data: {
        password: hashedNewPassword,
        email: targetEmail,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Master administrator credentials updated successfully.',
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('Admin change password error:', error);
    return res.status(500).json({ 
      message: 'Internal server error occurred while updating administrator credentials.' 
    });
  }
}
