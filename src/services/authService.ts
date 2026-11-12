/**
 * Authentication Service
 * Handles user registration, login, logout, password management,
 * session management, and security features.
 */

import { db } from '../db/store';
import { hashPassword, verifyPassword, generateSecureToken, generateSessionId, hashToken } from '../lib/crypto';
import { requireRateLimit, resetRateLimit, RATE_LIMIT_CONFIGS } from '../lib/rateLimiter';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../lib/errors';
import { logger } from '../lib/logger';
import { validators, validatePasswordStrength } from '../lib/validation';
import { AuditAction, Role, type User, type CreateUserInput } from '../db/schema';
import { audit } from './base';

// ============================================
// SESSION MANAGEMENT
// ============================================

interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

const sessions = new Map<string, Session>();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour idle timeout

// ============================================
// PASSWORD RESET TOKENS
// ============================================

interface PasswordResetToken {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const passwordResetTokens = new Map<string, PasswordResetToken>();
const RESET_TOKEN_DURATION = 60 * 60 * 1000; // 1 hour

// ============================================
// EMAIL VERIFICATION TOKENS
// ============================================

interface EmailVerificationToken {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const emailVerificationTokens = new Map<string, EmailVerificationToken>();
const VERIFY_TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ============================================
// AUTHENTICATION OPERATIONS
// ============================================

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  displayName: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<{ user: User; session: Session }> {
  // Rate limiting
  const rateLimitKey = `register:${metadata?.ipAddress || 'unknown'}`;
  requireRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.REGISTRATION);

  // Validate input
  validators.createUser.validateOrThrow({ email, displayName, password } as Parameters<typeof validators.createUser.validate>[0]);

  // Check password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    throw new ValidationError('Password does not meet strength requirements', {
      password: passwordCheck.issues,
    });
  }

  // Check if email already exists
  const existingUser = db.getUserByEmail(email);
  if (existingUser) {
    logger.security.warn(`Registration attempt with existing email: ${email}`, { ipAddress: metadata?.ipAddress });
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = db.createUser({
    email,
    passwordHash,
    displayName,
    emailVerified: false,
  });

  // Assign default role
  const userRole = db.getRoleByName(Role.USER);
  if (userRole) {
    db.assignRole(user.id, userRole.id);
  }

  // Create session
  const session = await createSession(user.id, metadata?.ipAddress, metadata?.userAgent);

  // Create email verification token
  await createEmailVerificationToken(user.id);

  // Audit log
  audit(AuditAction.CREATE, 'user', user.id, user.id, {
    email: user.email,
    displayName: user.displayName,
    ipAddress: metadata?.ipAddress,
  });

  logger.auth.info(`User registered: ${user.email}`, { userId: user.id, ipAddress: metadata?.ipAddress });

  return { user, session };
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<{ user: User; session: Session }> {
  // Rate limiting
  const rateLimitKey = `login:${metadata?.ipAddress || 'unknown'}`;
  requireRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.LOGIN);

  // Find user
  const user = db.getUserByEmail(email);
  if (!user) {
    logger.security.warn(`Login attempt with non-existent email: ${email}`, { ipAddress: metadata?.ipAddress });
    audit(AuditAction.LOGIN, 'user', null, null, {
      email,
      success: false,
      reason: 'user_not_found',
      ipAddress: metadata?.ipAddress,
    });
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    logger.security.warn(`Login attempt for inactive user: ${email}`, { userId: user.id });
    audit(AuditAction.LOGIN, 'user', user.id, user.id, {
      success: false,
      reason: 'account_inactive',
    });
    throw new UnauthorizedError('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    logger.security.warn(`Failed login attempt for: ${email}`, { userId: user.id, ipAddress: metadata?.ipAddress });
    audit(AuditAction.LOGIN, 'user', user.id, user.id, {
      success: false,
      reason: 'invalid_password',
      ipAddress: metadata?.ipAddress,
    });
    throw new UnauthorizedError('Invalid email or password');
  }

  // Reset rate limit on successful login
  resetRateLimit(rateLimitKey);

  // Update last login
  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  // Create session
  const session = await createSession(user.id, metadata?.ipAddress, metadata?.userAgent);

  // Audit log
  audit(AuditAction.LOGIN, 'user', user.id, user.id, {
    success: true,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  });

  logger.auth.info(`User logged in: ${user.email}`, { userId: user.id, ipAddress: metadata?.ipAddress });

  return { user, session };
}

/**
 * Logout and invalidate session
 */
export function logout(sessionId: string, userId: string): void {
  const session = sessions.get(sessionId);
  if (!session) {
    logger.auth.warn(`Logout attempt for non-existent session: ${sessionId}`);
    return;
  }

  // Verify session belongs to user
  if (session.userId !== userId) {
    logger.security.error(`Session hijacking attempt: session ${sessionId} does not belong to user ${userId}`);
    throw new ForbiddenError('Invalid session');
  }

  sessions.delete(sessionId);

  audit(AuditAction.LOGOUT, 'user', userId, userId, { sessionId });
  logger.auth.info(`User logged out: ${userId}`, { sessionId });
}

/**
 * Validate session and return user
 */
export function validateSession(sessionId: string): User | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const now = Date.now();

  // Check if session expired
  if (now > session.expiresAt) {
    sessions.delete(sessionId);
    logger.auth.info(`Session expired: ${sessionId}`, { userId: session.userId });
    return null;
  }

  // Check idle timeout
  if (now - session.lastActivity > SESSION_IDLE_TIMEOUT) {
    sessions.delete(sessionId);
    logger.auth.info(`Session idle timeout: ${sessionId}`, { userId: session.userId });
    return null;
  }

  // Update last activity
  session.lastActivity = now;
  sessions.set(sessionId, session);

  // Return user
  return db.getUserById(session.userId);
}

/**
 * Refresh session (extend expiration)
 */
export function refreshSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  const now = Date.now();

  // Check if session expired
  if (now > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }

  // Extend expiration
  session.expiresAt = now + SESSION_DURATION;
  session.lastActivity = now;
  sessions.set(sessionId, session);

  return true;
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string,
  metadata?: { ipAddress?: string }
): Promise<{ token: string; expiresAt: number }> {
  // Rate limiting
  const rateLimitKey = `password_reset:${metadata?.ipAddress || 'unknown'}`;
  requireRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.PASSWORD_RESET);

  const user = db.getUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    logger.auth.info(`Password reset requested for non-existent email: ${email}`);
    // Return fake token to prevent email enumeration
    return { token: 'fake_token', expiresAt: Date.now() + RESET_TOKEN_DURATION };
  }

  // Create reset token
  const token = await createPasswordResetToken(user.id);

  audit(AuditAction.PASSWORD_RESET, 'user', user.id, user.id, {
    action: 'requested',
    ipAddress: metadata?.ipAddress,
  });

  logger.auth.info(`Password reset requested: ${email}`, { userId: user.id });

  return token;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  metadata?: { ipAddress?: string }
): Promise<void> {
  // Find token
  const resetToken = passwordResetTokens.get(token);
  if (!resetToken || resetToken.used) {
    throw new ValidationError('Invalid or expired reset token', { token: ['Invalid token'] });
  }

  // Check expiration
  if (Date.now() > resetToken.expiresAt) {
    throw new ValidationError('Reset token has expired', { token: ['Token expired'] });
  }

  // Validate new password
  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.isValid) {
    throw new ValidationError('Password does not meet strength requirements', {
      password: passwordCheck.issues,
    });
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user
  db.updateUser(resetToken.userId, { passwordHash });

  // Mark token as used
  resetToken.used = true;
  passwordResetTokens.set(token, resetToken);

  // Invalidate all sessions for this user
  invalidateUserSessions(resetToken.userId);

  audit(AuditAction.PASSWORD_RESET, 'user', resetToken.userId, resetToken.userId, {
    action: 'completed',
    ipAddress: metadata?.ipAddress,
  });

  logger.auth.info(`Password reset completed: ${resetToken.userId}`, { ipAddress: metadata?.ipAddress });
}

/**
 * Change password (authenticated user)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  sessionId: string
): Promise<void> {
  const user = db.getUserById(userId);
  if (!user) throw new NotFoundError('User', userId);

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    logger.security.warn(`Password change failed - invalid current password`, { userId });
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Validate new password
  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.isValid) {
    throw new ValidationError('Password does not meet strength requirements', {
      password: passwordCheck.issues,
    });
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user
  db.updateUser(userId, { passwordHash });

  // Invalidate all other sessions
  for (const [sid, session] of sessions) {
    if (session.userId === userId && sid !== sessionId) {
      sessions.delete(sid);
    }
  }

  audit(AuditAction.UPDATE, 'user', userId, userId, { action: 'password_changed' });
  logger.auth.info(`Password changed: ${userId}`);
}

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * Verify email with token
 */
export function verifyEmail(token: string): void {
  const verifyToken = emailVerificationTokens.get(token);
  if (!verifyToken || verifyToken.used) {
    throw new ValidationError('Invalid or expired verification token', { token: ['Invalid token'] });
  }

  if (Date.now() > verifyToken.expiresAt) {
    throw new ValidationError('Verification token has expired', { token: ['Token expired'] });
  }

  // Mark user as verified
  db.updateUser(verifyToken.userId, { emailVerified: true });

  // Mark token as used
  verifyToken.used = true;
  emailVerificationTokens.set(token, verifyToken);

  logger.auth.info(`Email verified: ${verifyToken.userId}`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const now = Date.now();
  const session: Session = {
    id: generateSessionId(),
    userId,
    token: generateSecureToken(32),
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
    lastActivity: now,
    ipAddress,
    userAgent,
  };

  sessions.set(session.id, session);
  return session;
}

async function createPasswordResetToken(userId: string): Promise<{ token: string; expiresAt: number }> {
  const token = generateSecureToken(32);
  const now = Date.now();

  const resetToken: PasswordResetToken = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + RESET_TOKEN_DURATION,
    used: false,
  };

  passwordResetTokens.set(token, resetToken);

  return { token, expiresAt: resetToken.expiresAt };
}

async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateSecureToken(32);
  const now = Date.now();

  const verifyToken: EmailVerificationToken = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + VERIFY_TOKEN_DURATION,
    used: false,
  };

  emailVerificationTokens.set(token, verifyToken);

  return token;
}

function invalidateUserSessions(userId: string): void {
  for (const [sessionId, session] of sessions) {
    if (session.userId === userId) {
      sessions.delete(sessionId);
    }
  }
  logger.auth.info(`All sessions invalidated for user: ${userId}`);
}

// ============================================
// SESSION STATISTICS
// ============================================

export function getSessionStats(): {
  totalSessions: number;
  activeSessions: number;
} {
  const now = Date.now();
  let active = 0;

  for (const session of sessions.values()) {
    if (now <= session.expiresAt && now - session.lastActivity <= SESSION_IDLE_TIMEOUT) {
      active++;
    }
  }

  return {
    totalSessions: sessions.size,
    activeSessions: active,
  };
}

export function getUserSessions(userId: string): Session[] {
  const userSessions: Session[] = [];
  for (const session of sessions.values()) {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  }
  return userSessions;
}

export function clearAllSessions(): void {
  sessions.clear();
  passwordResetTokens.clear();
  emailVerificationTokens.clear();
}
