import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  let action = req.query.action as string;
  
  // If query action is missing or literal string, try extracting from URL path
  if (!action || action.startsWith(':') || action.startsWith('$')) {
    action = (req.url || '').split('/').pop()?.split('?')[0] || '';
  }

  console.log(`Stripe Handler: detected action=${action}, query=`, req.query, "url=", req.url);

  try {
    let subHandler;
    switch (action) {
      case 'create-checkout-session':
        subHandler = (await import('./_stripe/create-checkout-session.js')).default;
        break;
      case 'verify-session':
        subHandler = (await import('./_stripe/verify-session.js')).default;
        break;
      case 'config':
        return res.status(200).json({
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        });
      case 'status':
        return res.status(200).json({ 
          status: 'ok', 
          message: 'Stripe Handler is active',
          stripeConfigured: !!process.env.STRIPE_SECRET_KEY
        });
      default:
        return res.status(404).json({ message: `Action '${action}' not found in Stripe Handler` });
    }
    return await subHandler(req, res);
  } catch (error) {
    console.error(`Stripe Handler Error [${action}]:`, error);
    return res.status(500).json({ 
      message: 'Runtime error in Stripe Handler', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
