import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Disable debug in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not Found' });
  }

  res.status(200).json({
    status: 'ok',
    message: 'Debug endpoint is active (development only)',
  });
}
