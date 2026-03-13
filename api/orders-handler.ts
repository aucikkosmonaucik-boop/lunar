import type { VercelRequest, VercelResponse } from '@vercel/node';
import createOrder from './_orders/create.js';
import listOrders from './_orders/list.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const action = url.split('/').pop()?.split('?')[0];

  console.log(`Orders Handler: action=${action}, url=${url}`);

  switch (action) {
    case 'create': return createOrder(req, res);
    case 'list': return listOrders(req, res);
    default:
      return res.status(404).json({ message: `Action '${action}' not found in Orders Handler` });
  }
}
