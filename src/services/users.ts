/**
 * User Service
 * Business logic for user management with validation and authorization.
 */

import { db } from '../db/store';
import { validators } from '../lib/validation';
import { NotFoundError, ConflictError } from '../lib/errors';
import { logger } from '../lib/logger';
import {
  requirePermission, requireAuth, PERMISSIONS, type AuthContext,
} from '../lib/authorization';
import { toPaginatedResult, audit, handleDatabaseError } from './base';
import { AuditAction, Role, type User, type CreateUserInput, type SortParams } from '../db/schema';
import type { PaginationInput } from '../lib/pagination';

/**
 * User without sensitive fields
 */
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  roles: string[];
}

/**
 * Get a user by ID (public profile)
 */
export function getUserById(id: string): UserPublic | null {
  const user = db.getUserById(id);
  if (!user) return null;
  return toPublicUser(user);
}

/**
 * Get a user by email (for auth purposes)
 */
export function getUserByEmail(email: string): User | null {
  return db.getUserByEmail(email);
}

/**
 * List users with pagination
 */
export function listUsers(pagination?: PaginationInput, sort?: SortParams) {
  const { page, pageSize } = { page: pagination?.page ?? 1, pageSize: pagination?.pageSize ?? 12 };
  const result = db.listUsers({ page, pageSize }, sort);
  const publicUsers = result.data.map(toPublicUser);
  return toPaginatedResult({ data: publicUsers, total: result.total }, pagination);
}

/**
 * Create a new user
 */
export function createUser(input: CreateUserInput, ctx?: AuthContext) {
  // Validate
  validators.createUser.validateOrThrow({
    email: input.email,
    displayName: input.displayName,
    password: 'placeholder', // Password validation handled separately
  } as Parameters<typeof validators.createUser.validate>[0]);

  try {
    const user = db.createUser(input);

    audit(AuditAction.CREATE, 'user', user.id, ctx?.userId ?? user.id, {
      email: user.email,
      displayName: user.displayName,
    });

    logger.service.info(`User created: ${user.id}`, { email: user.email });
    return toPublicUser(user);
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Update a user
 */
export function updateUser(id: string, updates: Partial<User>, ctx: AuthContext) {
  requireAuth(ctx);

  // Users can update themselves, admins can update anyone
  if (ctx.userId !== id) {
    requirePermission(ctx, PERMISSIONS.USERS_MANAGE);
  }

  const existing = db.getUserById(id);
  if (!existing) throw new NotFoundError('User', id);

  // Don't allow password hash updates through this method
  const { passwordHash, ...safeUpdates } = updates as Partial<User> & { passwordHash?: string };

  try {
    const user = db.updateUser(id, safeUpdates);

    audit(AuditAction.UPDATE, 'user', id, ctx.userId, {
      changes: Object.keys(safeUpdates),
    });

    return toPublicUser(user);
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Deactivate a user (ban)
 */
export function deactivateUser(id: string, ctx: AuthContext) {
  requirePermission(ctx, PERMISSIONS.USERS_BAN);

  const existing = db.getUserById(id);
  if (!existing) throw new NotFoundError('User', id);

  try {
    const user = db.updateUser(id, { isActive: false });

    audit(AuditAction.UPDATE, 'user', id, ctx.userId, {
      action: 'deactivated',
    });

    logger.security.warn(`User deactivated: ${id}`, { by: ctx.userId });
    return toPublicUser(user);
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Assign a role to a user
 */
export function assignRoleToUser(userId: string, roleName: Role, ctx: AuthContext) {
  requirePermission(ctx, PERMISSIONS.USERS_ASSIGN_ROLE);

  const user = db.getUserById(userId);
  if (!user) throw new NotFoundError('User', userId);

  const role = db.getRoleByName(roleName);
  if (!role) throw new NotFoundError('Role', roleName);

  db.assignRole(userId, role.id, ctx.userId ?? undefined);

  audit(AuditAction.ROLE_CHANGE, 'user', userId, ctx.userId, {
    roleAssigned: roleName,
  });

  logger.security.info(`Role assigned: ${roleName} to user ${userId}`, { by: ctx.userId });
}

/**
 * Remove a role from a user
 */
export function removeRoleFromUser(userId: string, roleName: Role, ctx: AuthContext) {
  requirePermission(ctx, PERMISSIONS.USERS_ASSIGN_ROLE);

  const role = db.getRoleByName(roleName);
  if (!role) return;

  db.removeRole(userId, role.id);

  audit(AuditAction.ROLE_CHANGE, 'user', userId, ctx.userId, {
    roleRemoved: roleName,
  });
}

/**
 * Authenticate a user (verify credentials)
 */
export function authenticateUser(email: string, passwordHash: string): UserPublic | null {
  const user = db.getUserByEmail(email);
  if (!user) return null;
  if (!user.isActive) return null;
  if (user.passwordHash !== passwordHash) return null; // In production, use bcrypt

  // Update last login
  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  audit(AuditAction.LOGIN, 'user', user.id, user.id ?? undefined, { method: 'password' });

  return toPublicUser(user);
}

// ============================================
// HELPERS
// ============================================

function toPublicUser(user: User): UserPublic {
  const roles = db.getUserRoles(user.id).map(r => r.name);
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    roles,
  };
}
