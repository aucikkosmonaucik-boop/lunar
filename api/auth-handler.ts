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

  switch (action) {
    case 'login': return login(req, res);
    case 'logout': return logout(req, res);
    case 'register': return register(req, res);
    case 'update': return update(req, res);
    case 'verify': return verify(req, res);
    case 'forgot-password': return forgotPassword(req, res);
    case 'reset-password': return resetPassword(req, res);
    case 'verify-email': return verifyEmail(req, res);
    case 'delete-account': return deleteAccount(req, res);
    default:
      return res.status(404).json({ message: `Action '${action}' not found in Auth Handler` });
  }
}
