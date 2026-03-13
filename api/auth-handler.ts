import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = (req.query.action as string) || (req.url || '').split('/').pop()?.split('?')[0];

  console.log(`Auth Handler: action=${action}, query=`, req.query);

  try {
    let subHandler;
    switch (action) {
      case 'login': subHandler = (await import('./_auth/login.js')).default; break;
      case 'logout': subHandler = (await import('./_auth/logout.js')).default; break;
      case 'register': subHandler = (await import('./_auth/register.js')).default; break;
      case 'update': subHandler = (await import('./_auth/update.js')).default; break;
      case 'verify': subHandler = (await import('./_auth/verify.js')).default; break;
      case 'forgot-password': subHandler = (await import('./_auth/forgot-password.js')).default; break;
      case 'reset-password': subHandler = (await import('./_auth/reset-password.js')).default; break;
      case 'verify-email': subHandler = (await import('./_auth/verify-email.js')).default; break;
      case 'delete-account': subHandler = (await import('./_auth/delete-account.js')).default; break;
      case 'status': return res.status(200).json({ status: 'ok', message: 'Auth Handler is active' });
      default:
        return res.status(404).json({ message: `Action '${action}' not found in Auth Handler` });
    }
    return await subHandler(req, res);
  } catch (error) {
    console.error(`Auth Handler Error [${action}]:`, error);
    return res.status(500).json({ 
      message: 'Runtime error in Auth Handler', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
