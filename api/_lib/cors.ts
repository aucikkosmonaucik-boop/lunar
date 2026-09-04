import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?mylunar\.shop$/,
  /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Same-origin or non-browser client (mobile apps, curl, etc.)
  
  const configuredAppUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredAppUrl) {
    try {
      const configuredOrigin = new URL(configuredAppUrl).origin;
      if (origin.toLowerCase() === configuredOrigin.toLowerCase()) {
        return true;
      }
    } catch {
      // Ignore invalid URL configuration
    }
  }

  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Same-origin request without Origin header
  } else {
    // Origin is not allowed
    if (req.method === 'OPTIONS') {
      res.status(403).json({ message: 'CORS origin not allowed' });
      return true;
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie, x-admin-key'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
