import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  let action = req.query.action as string;
  
  // If query action is missing or literal string, try path
  if (!action || action.startsWith(':') || action.startsWith('$')) {
    action = (req.url || '').split('/').pop()?.split('?')[0] || '';
  }

  console.log(`Orders Handler: detected action=${action}, query=`, req.query, "url=", req.url);

  try {
    let subHandler;
    switch (action) {
      case 'create': subHandler = (await import('./_orders/create.js')).default; break;
      case 'list': 
      case 'track': subHandler = (await import('./_orders/list.js')).default; break;
      case 'update': subHandler = (await import('./_orders/update.js')).default; break;
      case 'status': return res.status(200).json({ status: 'ok', message: 'Orders Handler is active' });
      default:
        return res.status(404).json({ message: `Action '${action}' not found in Orders Handler` });
    }
    return await subHandler(req, res);
  } catch (error) {
    console.error(`Orders Handler Error [${action}]:`, error);
    return res.status(500).json({ 
      message: 'Internal server error in orders handler.', 
    });
  }
}
