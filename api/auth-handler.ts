import type { VercelRequest, VercelResponse } from '@vercel/node';
import login from './_auth/login.js';
import logout from './_auth/logout.js';
import register from './_auth/register.js';
import update from './_auth/update.js';
import verify from './_auth/verify.js';
import forgotPassword from './_auth/forgot-password.js';
import resetPassword from './_auth/reset-password.js';
import verifyEmail from './_auth/verify-email.js';
import deleteAccount from './_auth/delete-account.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const action = url.split('/').pop()?.split('?')[0];

  console.log(`Auth Handler: action=${action}, url=${url}`);

  try {
    switch (action) {
      case 'login': return await login(req, res);
      case 'logout': return await logout(req, res);
      case 'register': return await register(req, res);
      case 'update': return await update(req, res);
      case 'verify': return await verify(req, res);
      case 'forgot-password': return await forgotPassword(req, res);
      case 'reset-password': return await resetPassword(req, res);
      case 'verify-email': return await verifyEmail(req, res);
      case 'delete-account': return await deleteAccount(req, res);
      case 'status': return res.status(200).json({ status: 'ok', message: 'Auth Handler is active' });
      default:
        return res.status(404).json({ message: `Action '${action}' not found in Auth Handler` });
    }
  } catch (error) {
    console.error(`Auth Handler Error [${action}]:`, error);
    return res.status(500).json({ 
      message: 'Runtime error in Auth Handler', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
