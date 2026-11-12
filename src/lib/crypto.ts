/**
 * Cryptographic Utilities
 * Secure password hashing using Web Crypto API (SHA-256 + salt).
 * In production, this would use bcrypt/argon2 server-side.
 * This implementation provides equivalent security properties for the client-side demo.
 */

import { logger } from './logger';

const SALT_LENGTH = 32;
const HASH_ITERATIONS = 100000;

/**
 * Generate a cryptographically secure random salt
 */
function generateSalt(): string {
  const array = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with PBKDF2 via Web Crypto API
 * Format: iterations$salt$hash (all hex-encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Convert to hex
  const hash = Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('');

  return `${HASH_ITERATIONS}$${salt}$${hash}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;

    const [, salt, expectedHash] = parts;
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: HASH_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const computedHash = Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('');

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(computedHash, expectedHash);
  } catch (error) {
    logger.security.error('Password verification failed', { error: (error as Error).message });
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a secure random token (for password reset, email verification, sessions)
 */
export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `sess_${generateSecureToken(24)}`;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return `csrf_${generateSecureToken(16)}`;
}

/**
 * Hash a token for storage (so we don't store raw tokens)
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
