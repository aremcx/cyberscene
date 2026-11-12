/**
 * Security Middleware
 * Production-ready security headers and protections
 */

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Strict Transport Security (enable in production)
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(headers: Record<string, string>): Record<string, string> {
  return {
    ...headers,
    ...securityHeaders,
  };
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  
  const appUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    appUrl,
  ].filter(Boolean);
  
  return allowedOrigins.includes(origin);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Rate limit configuration for different endpoints
 */
export const rateLimitConfig = {
  // Authentication endpoints
  login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
  resetPassword: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
  
  // API endpoints
  api: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  
  // AI assistant
  ai: { windowMs: 60 * 60 * 1000, max: 20 }, // 20 requests per hour
  
  // Newsletter
  newsletter: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 subscriptions per hour
};

/**
 * Check if request is from trusted IP
 */
export function isTrustedIP(ip: string): boolean {
  const trustedIPs = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRUSTED_IPS) || '').split(',').filter(Boolean);
  return trustedIPs.includes(ip);
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'error' = 'info'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
  };
  
  console.log(`[SECURITY ${severity.toUpperCase()}]`, JSON.stringify(logEntry));
}
