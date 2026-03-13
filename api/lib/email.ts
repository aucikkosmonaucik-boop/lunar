import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  try {
    const templatePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, value);
    });

    // Default placeholders if not provided
    const defaults = {
      SHOP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.ie',
      PRIVACY_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.ie'}/privacy`,
      UNSUBSCRIBE_URL: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mylunar.ie'}/unsubscribe`,
    };

    Object.entries(defaults).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      if (!data[key]) {
        html = html.replace(placeholder, value);
      }
    });

    const { data: resData, error } = await resend.emails.send({
      from: 'Lunar <onboarding@resend.dev>', // Change this after domain verification
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return resData;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
