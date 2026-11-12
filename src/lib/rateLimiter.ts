/**
 * Rate Limiter
 * Protects against brute force attacks and API abuse.
 * Implements sliding window rate limiting with IP and user-based tracking.
 */

import { logger } from './logger';
import { RateLimitError } from './errors';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

// Configuration presets
export const RATE_LIMIT_CONFIGS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  },
  REGISTRATION: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  API_GENERAL: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// In-memory store for rate limit entries
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries();
  }

  if (!entry) {
    entry = {
      count: 0,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    };
    rateLimitStore.set(key, entry);
  }

  // Check if currently blocked
  if (entry.blocked && entry.blockedUntil) {
    if (now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      logger.security.warn(`Rate limit exceeded for ${key}`, { retryAfter });
      return { allowed: false, remaining: 0, retryAfter };
    } else {
      // Block expired, reset
      entry.blocked = false;
      entry.count = 0;
      entry.firstAttempt = now;
    }
  }

  // Check if window has expired
  if (now - entry.firstAttempt > config.windowMs) {
    entry.count = 0;
    entry.firstAttempt = now;
  }

  // Increment counter
  entry.count++;
  entry.lastAttempt = now;

  // Check if limit exceeded
  if (entry.count > config.maxAttempts) {
    entry.blocked = true;
    entry.blockedUntil = now + config.blockDurationMs;
    const retryAfter = Math.ceil(config.blockDurationMs / 1000);

    logger.security.warn(`Rate limit triggered for ${key}`, {
      attempts: entry.count,
      blockDuration: config.blockDurationMs,
    });

    return { allowed: false, remaining: 0, retryAfter };
  }

  const remaining = config.maxAttempts - entry.count;
  return { allowed: true, remaining };
}

/**
 * Require rate limit check - throws if exceeded
 */
export function requireRateLimit(key: string, config: RateLimitConfig): void {
  const result = checkRateLimit(key, config);
  if (!result.allowed) {
    throw new RateLimitError(
      `Too many attempts. Please try again in ${result.retryAfter} seconds.`
    );
  }
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(key: string): RateLimitEntry | null {
  return rateLimitStore.get(key) ?? null;
}

/**
 * Clear all rate limit entries (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, entry] of rateLimitStore) {
    if (now - entry.lastAttempt > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get statistics about rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number;
  blockedEntries: number;
} {
  let blocked = 0;
  for (const entry of rateLimitStore.values()) {
    if (entry.blocked) blocked++;
  }
  return {
    totalEntries: rateLimitStore.size,
    blockedEntries: blocked,
  };
}
