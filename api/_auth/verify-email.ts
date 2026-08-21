import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { sendEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Missing token' });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: null,
      },
    });

    // Send welcome email after successful verification
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Lunar',
        templateName: 'welcome',
        data: {
          FIRST_NAME: user.name || 'Valued Guest',
        },
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Redirect to a success page or login
    return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop'}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
