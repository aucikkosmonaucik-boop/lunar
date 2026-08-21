import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

interface EmailTemplateData {
  [key: string]: string;
}

export async function sendEmail({
  to,
  subject,
  templateName,
  data,
}: {
  to: string;
  subject: string;
  templateName: 'welcome' | 'verify-account' | 'reset-password';
  data: EmailTemplateData;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[Resend] RESEND_API_KEY is not set. Simulation mode: Email to ${to} with subject "${subject}" was skipped.`);
    return { id: `simulated_${Date.now()}` };
  }

  try {
    const resend = new Resend(apiKey);
    const templatePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf8');

    // Default placeholders
    const defaults: Record<string, string> = {
      SHOP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop',
      PRIVACY_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop'}/terms`,
      UNSUBSCRIBE_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.shop'}/contact`,
      SUPPORT_EMAIL: 'contact@mylunar.shop',
    };

    // Merge provided data with defaults
    const fullData = { ...defaults, ...data };

    // Replace all {{KEY}} placeholders in HTML
    Object.entries(fullData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, value || '');
    });

    const fromAddress = process.env.EMAIL_FROM || 'Lunar <onboarding@resend.dev>';

    const { data: resData, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      throw new Error(error.message);
    }

    return resData;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

