import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired records every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',');
    return ips[0].trim();
  }
  return req.headers['x-real-ip'] as string || req.socket?.remoteAddress || 'unknown-ip';
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}

export function isRateLimited(
  req: VercelRequest,
  options: RateLimitOptions,
  customIdentifier?: string
): { limited: boolean; remaining: number; resetAfterSec: number } {
  cleanupExpiredRecords();

  const ip = getClientIp(req);
  const prefix = options.keyPrefix || 'rl';
  const key = `${prefix}:${customIdentifier || ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    record = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      limited: false,
      remaining: options.max - 1,
      resetAfterSec: Math.ceil(options.windowMs / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, options.max - record.count);
  const resetAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  if (record.count > options.max) {
    return {
      limited: true,
      remaining: 0,
      resetAfterSec,
    };
  }

  return {
    limited: false,
    remaining,
    resetAfterSec,
  };
}

export function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  options: RateLimitOptions,
  customIdentifier?: string
): boolean {
  const { limited, resetAfterSec } = isRateLimited(req, options, customIdentifier);

  if (limited) {
    res.setHeader('Retry-After', resetAfterSec);
    res.status(429).json({
      message: options.message || `Too many requests. Please try again in ${resetAfterSec} seconds.`,
      retryAfterSeconds: resetAfterSec,
    });
    return true;
  }

  return false;
}
