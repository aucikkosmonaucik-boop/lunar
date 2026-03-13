import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { name, email, password } = req.body;

    const dataToUpdate: { name?: string; email?: string; password?: string } = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Update Error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ 
      message: 'Internal server error',
      error: err.message
    });
  }
}
