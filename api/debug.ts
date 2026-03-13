import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    message: 'Debug endpoint is working',
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      has_jwt_secret: !!process.env.JWT_SECRET,
      node_env: process.env.NODE_ENV,
    },
    url: req.url,
    query: req.query,
    method: req.method,
  });
}
