import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../lib/email.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.ie'}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: email,
        subject: 'Verify Your Account — Lunar',
        templateName: 'verify-account',
        data: {
          VERIFICATION_URL: verificationUrl,
        },
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return res.status(201).json({ message: 'User created successfully. Please check your email to verify your account.', user });
  } catch (error) {
    const err = error as Error;
    console.error('Registration error:', err);
    res.status(500).json({ message: `Prisma/Vercel Error: ${err.message}`, stack: err.stack });
  }
}
