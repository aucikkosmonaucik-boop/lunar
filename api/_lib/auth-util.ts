import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { prisma } from './prisma.js';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production.');
    }
    console.warn('SECURITY WARNING: JWT_SECRET is not set. Using dev fallback only for local testing.');
    return 'dev-only-secret-do-not-use-in-production-lunar-2026';
  }
  return secret;
}

export interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
}

export function extractToken(req: VercelRequest): string | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const extracted = authHeader.substring(7).trim();
    if (extracted && extracted !== 'null' && extracted !== 'undefined') {
      return extracted;
    }
  }

  // 2. Check Cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    try {
      const cookies = parse(cookieHeader);
      if (cookies.auth_token) {
        return cookies.auth_token;
      }
    } catch {
      // Ignore malformed cookies
    }
  }

  return null;
}

export function verifyToken(req: VercelRequest): DecodedToken | null {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as DecodedToken;
    if (decoded && decoded.userId) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkAdmin(req: VercelRequest): Promise<{ isAdmin: boolean; userId?: string; email?: string }> {
  // 1. Check secure Admin Key header (for automation/webhooks/owner direct API access)
  const adminKey = req.headers['x-admin-key'];
  const configuredAdminKey = process.env.ADMIN_KEY;

  if (
    typeof adminKey === 'string' &&
    typeof configuredAdminKey === 'string' &&
    configuredAdminKey.length >= 16 &&
    adminKey === configuredAdminKey
  ) {
    return { isAdmin: true };
  }

  // 2. Check user JWT session
  const decoded = verifyToken(req);
  if (!decoded || !decoded.userId) {
    return { isAdmin: false };
  }

  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (user && user.role === 'ADMIN') {
      return { isAdmin: true, userId: user.id, email: user.email };
    }
  } catch (err) {
    console.error('Error verifying admin in database:', err);
  }

  return { isAdmin: false };
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ isAdmin: boolean; userId?: string; email?: string }> {
  const adminCheck = await checkAdmin(req);
  if (!adminCheck.isAdmin) {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    return { isAdmin: false };
  }
  return adminCheck;
}
