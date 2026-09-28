/**
 * Authorization Service
 * Handles permission checks, role verification, and access control.
 */

import { db } from '../db/store';
import { ForbiddenError, UnauthorizedError } from './errors';
import { logger } from './logger';
import type { Role } from '../db/schema';

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Content
  CONTENT_READ: 'content:read',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT_OWN: 'content:edit:own',
  CONTENT_EDIT_ANY: 'content:edit:any',
  CONTENT_DELETE_OWN: 'content:delete:own',
  CONTENT_DELETE_ANY: 'content:delete:any',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_FEATURE: 'content:feature',

  // Users
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  USERS_ASSIGN_ROLE: 'users:assign_role',
  USERS_BAN: 'users:ban',

  // System
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_ADMIN: 'system:admin',

  // Community
  COMMUNITY_READ: 'community:read',
  COMMUNITY_POST: 'community:post',
  COMMUNITY_MODERATE: 'community:moderate',

  // Intelligence
  INTELLIGENCE_READ: 'intelligence:read',
  INTELLIGENCE_CREATE: 'intelligence:create',
  INTELLIGENCE_MANAGE: 'intelligence:manage',

  // Academy
  ACADEMY_READ: 'academy:read',
  ACADEMY_CREATE: 'academy:create',
  ACADEMY_MANAGE: 'academy:manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Context for authorization checks
 */
export interface AuthContext {
  userId: string | null;
  roles: string[];
  permissions: string[];
}

/**
 * Build an auth context from a user ID
 */
export function buildAuthContext(userId: string | null): AuthContext {
  if (!userId) {
    return { userId: null, roles: [], permissions: [] };
  }

  const userRoles = db.getUserRoles(userId);
  const roleNames = userRoles.map(r => r.name);

  // Collect all permissions from all roles
  const permissionSet = new Set<string>();
  for (const role of userRoles) {
    const rolePerms = db.getRolePermissions(role.id);
    for (const perm of rolePerms) {
      permissionSet.add(perm.name);
    }
  }

  return {
    userId,
    roles: roleNames,
    permissions: Array.from(permissionSet),
  };
}

/**
 * Check if the context has a specific permission
 */
export function hasPermission(ctx: AuthContext, permission: string): boolean {
  return ctx.permissions.includes(permission);
}

/**
 * Check if the context has any of the specified permissions
 */
export function hasAnyPermission(ctx: AuthContext, permissions: string[]): boolean {
  return permissions.some(p => ctx.permissions.includes(p));
}

/**
 * Check if the context has all of the specified permissions
 */
export function hasAllPermissions(ctx: AuthContext, permissions: string[]): boolean {
  return permissions.every(p => ctx.permissions.includes(p));
}

/**
 * Require authentication - throws if not authenticated
 */
export function requireAuth(ctx: AuthContext): void {
  if (!ctx.userId) {
    logger.security.warn('Unauthorized access attempt');
    throw new UnauthorizedError();
  }
}

/**
 * Require a specific permission - throws if not permitted
 */
export function requirePermission(ctx: AuthContext, permission: string): void {
  requireAuth(ctx);
  if (!hasPermission(ctx, permission)) {
    logger.security.warn(`Permission denied: ${permission}`, { userId: ctx.userId });
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(ctx: AuthContext, permissions: string[]): void {
  requireAuth(ctx);
  if (!hasAnyPermission(ctx, permissions)) {
    logger.security.warn(`Permission denied: needs one of [${permissions.join(', ')}]`, { userId: ctx.userId });
    throw new ForbiddenError();
  }
}

/**
 * Check if user can edit an article (own or any based on permissions)
 */
export function canEditArticle(ctx: AuthContext, articleAuthorId: string): boolean {
  if (hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_ANY)) return true;
  if (hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_OWN) && ctx.userId === articleAuthorId) return true;
  return false;
}

/**
 * Check if user can delete an article
 */
export function canDeleteArticle(ctx: AuthContext, articleAuthorId: string): boolean {
  if (hasPermission(ctx, PERMISSIONS.CONTENT_DELETE_ANY)) return true;
  if (hasPermission(ctx, PERMISSIONS.CONTENT_DELETE_OWN) && ctx.userId === articleAuthorId) return true;
  return false;
}

/**
 * Require that user can edit an article
 */
export function requireCanEditArticle(ctx: AuthContext, articleAuthorId: string): void {
  requireAuth(ctx);
  if (!canEditArticle(ctx, articleAuthorId)) {
    throw new ForbiddenError('You cannot edit this article');
  }
}

/**
 * Require that user can delete an article
 */
export function requireCanDeleteArticle(ctx: AuthContext, articleAuthorId: string): void {
  requireAuth(ctx);
  if (!canDeleteArticle(ctx, articleAuthorId)) {
    throw new ForbiddenError('You cannot delete this article');
  }
}

/**
 * Check if a user has a specific role
 */
export function hasRole(ctx: AuthContext, role: Role): boolean {
  return ctx.roles.includes(role);
}

/**
 * Require a specific role
 */
export function requireRole(ctx: AuthContext, role: Role): void {
  requireAuth(ctx);
  if (!hasRole(ctx, role)) {
    throw new ForbiddenError(`Required role: ${role}`);
  }
}
