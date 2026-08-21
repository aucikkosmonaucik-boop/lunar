import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
}

export function extractToken(req: VercelRequest): string | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    if (cookies.auth_token) {
      return cookies.auth_token;
    }
  }

  return null;
}

export function verifyToken(req: VercelRequest): DecodedToken | null {
  const token = extractToken(req);
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}
