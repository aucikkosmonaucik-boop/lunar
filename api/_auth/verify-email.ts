import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { sendEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop';

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.redirect(`${baseUrl}/login?error=missing_token`);
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      // Token was either already used/verified or does not exist
      return res.redirect(`${baseUrl}/login?already_verified=true`);
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
        subject: 'Welcome to Lunar — Your Account is Active',
        templateName: 'welcome',
        data: {
          FIRST_NAME: user.name || 'Valued Client',
        },
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Redirect to login with verified status
    return res.redirect(`${baseUrl}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return res.redirect(`${baseUrl}/login?error=verification_failed`);
  }
}
