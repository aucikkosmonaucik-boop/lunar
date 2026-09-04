import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { extractToken, getJwtSecret } from '../_lib/auth-util.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please sign in.' });
    }

    const jwtSecret = getJwtSecret();
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as { userId: string };
    } catch {
      return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
    }

    const { name, email, currentPassword, password, street, city, postalCode, country, phone } = req.body || {};

    const existingUser = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, password: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const dataToUpdate: Record<string, any> = {};

    if (name !== undefined) dataToUpdate.name = String(name).trim().slice(0, 100);
    if (street !== undefined) dataToUpdate.street = String(street).trim().slice(0, 150);
    if (city !== undefined) dataToUpdate.city = String(city).trim().slice(0, 80);
    if (postalCode !== undefined) dataToUpdate.postalCode = String(postalCode).trim().slice(0, 30);
    if (country !== undefined) dataToUpdate.country = String(country).trim().slice(0, 60);
    if (phone !== undefined) dataToUpdate.phone = String(phone).trim().slice(0, 30);

    // Email change check
    if (email && String(email).trim().toLowerCase() !== existingUser.email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ message: 'Invalid email address provided.' });
      }
      const duplicate = await (prisma as any).user.findUnique({ where: { email: cleanEmail } });
      if (duplicate && duplicate.id !== existingUser.id) {
        return res.status(400).json({ message: 'This email is already in use by another account.' });
      }
      dataToUpdate.email = cleanEmail;
    }

    // Password change check: REQUIRE current password verification!
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }

      const isCurrentMatch = await bcrypt.compare(String(currentPassword), existingUser.password);
      if (!isCurrentMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      if (String(password).length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
      }

      dataToUpdate.password = await bcrypt.hash(String(password), 12);
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: decoded.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        street: true,
        city: true,
        postalCode: true,
        country: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
}
