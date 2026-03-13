import type { VercelRequest, VercelResponse } from '@vercel/node';
import createOrder from './_orders/create.js';
import listOrders from './_orders/list.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const action = url.split('/').pop()?.split('?')[0];

  console.log(`Orders Handler: action=${action}, url=${url}`);

  try {
    switch (action) {
      case 'create': return await createOrder(req, res);
      case 'list': return await listOrders(req, res);
      case 'status': return res.status(200).json({ status: 'ok', message: 'Orders Handler is active' });
      default:
        return res.status(404).json({ message: `Action '${action}' not found in Orders Handler` });
    }
  } catch (error) {
    console.error(`Orders Handler Error [${action}]:`, error);
    return res.status(500).json({ 
      message: 'Runtime error in Orders Handler', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
